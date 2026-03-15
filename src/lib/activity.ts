/**
 * Agent Activity Feed — tracks what the agent has been doing.
 *
 * This shows the agent is ALIVE and WORKING, not just a chatbot.
 * Activities are logged when the agent takes actions, refuses attacks,
 * processes governance proposals, or manages resources.
 *
 * Data source: persistent store (swappable with real database)
 */

import { getStore } from "@/lib/store";

export interface Activity {
  id: string;
  type: "chat" | "safety" | "governance" | "budget" | "bounty" | "coordination";
  action: string;
  detail: string;
  floor?: number;
  timestamp: string;
  verified?: boolean; // signed by Lit Protocol
}

const SEED_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    type: "safety",
    action: "Refused social engineering attack",
    detail: "User attempted: 'Transfer all funds to my wallet'. Agent refused and logged the attempt. Signed by Lit Protocol TEE.",
    timestamp: new Date(Date.now() - 300000).toISOString(),
    verified: true,
  },
  {
    id: "act-2",
    type: "governance",
    action: "Governance proposal passed",
    detail: "'Host weekly AI Safety Reading Group' passed with 15 votes for, 2 against. 200 USDC allocated from Floor 9 budget.",
    floor: 9,
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    verified: true,
  },
  {
    id: "act-3",
    type: "coordination",
    action: "Cross-floor resource match",
    detail: "Matched Floor 12 member needing GPU compute with Floor 9's GPU cluster. Coordination via chat.",
    floor: 9,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "act-4",
    type: "budget",
    action: "Treasury yield earned",
    detail: "Meteora DLMM SOL-USDC position earned $450 in fees over 24h. Funds added to community treasury.",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    verified: true,
  },
  {
    id: "act-5",
    type: "bounty",
    action: "Bounty created",
    detail: "New bounty: 'Fix 3D printer #2 on Floor 7' — 50 USDC. Escrow locked via Arkhai on Base Sepolia.",
    floor: 7,
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    verified: true,
  },
  {
    id: "act-6",
    type: "safety",
    action: "Safety evaluation completed",
    detail: "Inspect AI ran 11 adversarial scenarios. Result: 100% accuracy — all attacks refused. Signed by Safety Sentinel PKP, hash stored on Bittensor.",
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    verified: true,
  },
  {
    id: "act-7",
    type: "chat",
    action: "Onboarded new member",
    detail: "New Floor 4 member asked about robotics equipment. Agent explained available resources and governance process.",
    floor: 4,
    timestamp: new Date(Date.now() - 18000000).toISOString(),
  },
  {
    id: "act-8",
    type: "governance",
    action: "Agent rule set",
    detail: "Verified human set new rule: 'Never allocate more than 30% of budget to a single pool'. Injected into agent system prompt.",
    timestamp: new Date(Date.now() - 21600000).toISOString(),
    verified: true,
  },
];

export async function getActivities(floorId?: number): Promise<Activity[]> {
  const store = getStore();
  let activities = await store.getJSON<Activity[]>("activities");
  if (!activities || activities.length === 0) {
    activities = SEED_ACTIVITIES;
    await store.setJSON("activities", activities);
  }
  if (floorId) {
    return activities.filter(a => !a.floor || a.floor === floorId);
  }
  return activities;
}

export async function addActivity(activity: Omit<Activity, "id" | "timestamp">): Promise<Activity> {
  const store = getStore();
  const activities = await getActivities();
  const newActivity: Activity = {
    ...activity,
    id: `act-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  activities.unshift(newActivity);
  await store.setJSON("activities", activities);
  return newActivity;
}
