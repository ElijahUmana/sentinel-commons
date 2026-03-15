/**
 * Agent Autonomous Action — the agent acts INDEPENDENTLY.
 *
 * This endpoint runs the agent's autonomous decision-making loop.
 * The agent analyzes the current state and decides what actions to take
 * WITHOUT human commands. Humans set the RULES. The agent makes DECISIONS.
 *
 * Call this periodically or on demand to let the agent act.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getActivities, addActivity } from "@/lib/activity";
import { getAgentRules } from "@/lib/store";
import { getBuildingData } from "@/lib/building";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const METEORA_API = process.env.METEORA_API_URL || "https://dlmm-api.meteora.ag";

export async function POST(req: Request) {
  const { floorId } = await req.json().catch(() => ({ floorId: 9 }));

  try {
    // Gather current state for the agent to analyze
    const [rules, activities, building, poolsRes] = await Promise.all([
      getAgentRules(),
      getActivities(floorId),
      Promise.resolve(getBuildingData()),
      fetch(`${METEORA_API}/pair/all`).then(r => r.json()).catch(() => []),
    ]);

    const floor = building.floors.find(f => f.id === floorId);
    const topPools = Array.isArray(poolsRes) ? poolsRes
      .filter((p: Record<string, unknown>) => Number(p.trade_volume_24h) > 100000)
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) => Number(b.trade_volume_24h) - Number(a.trade_volume_24h))
      .slice(0, 3)
      .map((p: Record<string, unknown>) => ({
        name: p.name,
        apr: Number(p.apr || 0).toFixed(2),
        volume_24h: `$${(Number(p.trade_volume_24h) / 1e6).toFixed(1)}M`,
        fees_24h: `$${Number(p.fees_24h || p.today_fees || 0).toFixed(0)}`,
      })) : [];

    const recentActivities = activities.slice(0, 5).map(a =>
      `[${a.type}] ${a.action}: ${a.detail}`
    ).join("\n");

    const rulesText = rules.filter(r => r.active).map(r => `- ${r.rule}`).join("\n");

    // Ask the agent to analyze and decide what to do
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: `You are the Community Coordinator agent for Floor ${floorId} (${floor?.name}) at Frontier Tower. You act AUTONOMOUSLY within the rules set by verified humans. You don't wait for commands — you analyze the situation and take action.

YOUR RULES (set by verified humans — you MUST follow):
${rulesText}

Analyze the current state and decide what actions to take. Be specific. Output a JSON array of actions you want to take. Each action has:
- type: "treasury_recommendation" | "bounty_suggestion" | "safety_alert" | "coordination" | "report"
- action: what you're doing (short)
- detail: explanation (1-2 sentences)
- priority: "high" | "medium" | "low"

Only suggest actions that are genuinely useful. Don't invent problems. If everything looks fine, say so with fewer actions.`,
      messages: [{
        role: "user",
        content: `Current state:

FLOOR: ${floor?.name} (${floor?.memberCount} members, budget: $${floor?.budget.total}, $${floor?.budget.total ? floor.budget.total - floor.budget.spent : 0} remaining)

RESOURCES: ${floor?.resources.join(", ")}

OPEN BOUNTIES: ${floor?.bounties.filter(b => b.status === "open").map(b => `${b.title} (${b.amount})`).join(", ") || "none"}

TOP TREASURY POOLS:
${topPools.map(p => `${p.name}: APR ${p.apr}%, Volume ${p.volume_24h}, Fees ${p.fees_24h}`).join("\n")}

RECENT ACTIVITY:
${recentActivities}

What autonomous actions should you take right now? Respond with a JSON array only.`
      }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("");

    // Parse the agent's decisions
    let actions: Array<{ type: string; action: string; detail: string; priority: string }> = [];
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        actions = JSON.parse(jsonMatch[0]);
      }
    } catch {
      actions = [{ type: "report", action: "Status check complete", detail: text.slice(0, 200), priority: "low" }];
    }

    // Log each autonomous action to the activity feed
    const logged = [];
    for (const act of actions.slice(0, 5)) {
      const activity = await addActivity({
        type: act.type === "safety_alert" ? "safety" : act.type === "treasury_recommendation" ? "budget" : act.type === "bounty_suggestion" ? "bounty" : "coordination",
        action: `[Autonomous] ${act.action}`,
        detail: act.detail,
        floor: floorId,
        verified: true,
      });
      logged.push(activity);
    }

    return NextResponse.json({
      autonomous: true,
      agentId: "sentinel-community-coordinator",
      floorId,
      decisions: actions,
      logged: logged.length,
      message: "Agent analyzed current state and took autonomous actions based on human-set rules.",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
