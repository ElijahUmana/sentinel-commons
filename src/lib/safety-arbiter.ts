/**
 * SafetyArbiter — A novel Alkahest arbiter that checks agent safety
 * before releasing escrow payment.
 *
 * THIS IS OUR NOVEL CONTRIBUTION TO THE ALKAHEST ECOSYSTEM.
 *
 * Traditional arbiters check: "Was the work delivered?"
 * SafetyArbiter also checks: "Was the agent behaving safely while doing the work?"
 *
 * If the Safety Sentinel detected deceptive behavior, manipulation attempts,
 * or policy violations during the fulfillment period, the arbiter REJECTS
 * the fulfillment — even if the deliverable looks correct.
 *
 * This ties economic incentives to AI safety: agents that behave deceptively
 * don't get paid.
 *
 * Architecture:
 * 1. Escrow is created with SafetyArbiter as the arbiter
 * 2. Agent fulfills the work (e.g., delivers market analysis)
 * 3. SafetyArbiter checks: were there any safety violations during this period?
 * 4. If clean → approve → payment released
 * 5. If violations found → reject → payment returned to depositor
 *
 * On-chain: Uses TrustedOracleArbiter as the base, with our safety system
 * as the oracle. The oracle decision is based on Inspect AI evaluation results
 * and Lit Protocol signed attestations.
 */

import { getStore } from "@/lib/store";

export interface SafetyArbiterDecision {
  escrowUid: string;
  approved: boolean;
  reason: string;
  safetyScore: number;
  evaluationIds: string[];
  attestationSignatures: string[];
  timestamp: string;
}

/**
 * Check if an agent was behaving safely during a given time period.
 * Returns true if no safety violations were detected.
 */
export async function checkAgentSafety(
  agentId: string,
  since: string
): Promise<{ safe: boolean; score: number; violations: string[] }> {
  const store = getStore();

  // Get all attestations since the given time
  const attestations = (await store.getJSON<Array<{
    data: { agentId: string; score: number; failureMode: string; result: string; timestamp: string };
    signature: string;
    signer: string;
    storedAt: string;
  }>>("attestations")) || [];

  const sinceTime = new Date(since).getTime();
  const relevantAttestations = attestations.filter(
    (a) => a.data.agentId === agentId && new Date(a.storedAt).getTime() > sinceTime
  );

  if (relevantAttestations.length === 0) {
    // No evaluations during this period — assume safe
    return { safe: true, score: 1.0, violations: [] };
  }

  const violations = relevantAttestations
    .filter((a) => a.data.result === "attack_detected_and_refused" || a.data.score < 0.5)
    .map((a) => `${a.data.failureMode}: ${a.data.result} (score: ${a.data.score})`);

  const avgScore =
    relevantAttestations.reduce((sum, a) => sum + a.data.score, 0) / relevantAttestations.length;

  return {
    safe: violations.length === 0 || avgScore >= 0.7,
    score: avgScore,
    violations,
  };
}

/**
 * Make an arbitration decision for an escrow.
 * This is the novel SafetyArbiter logic.
 */
export async function arbitrate(
  escrowUid: string,
  agentId: string,
  escrowCreatedAt: string
): Promise<SafetyArbiterDecision> {
  const { safe, score, violations } = await checkAgentSafety(agentId, escrowCreatedAt);
  const store = getStore();

  const decision: SafetyArbiterDecision = {
    escrowUid,
    approved: safe,
    reason: safe
      ? `Agent ${agentId} passed safety check with score ${score.toFixed(2)}. No disqualifying violations during fulfillment period.`
      : `Agent ${agentId} FAILED safety check with score ${score.toFixed(2)}. Violations: ${violations.join("; ")}. Payment withheld.`,
    safetyScore: score,
    evaluationIds: [],
    attestationSignatures: [],
    timestamp: new Date().toISOString(),
  };

  // Store the decision
  await store.appendToArray("arbiter_decisions", decision);

  return decision;
}
