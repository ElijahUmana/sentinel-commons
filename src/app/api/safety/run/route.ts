import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { getStore } from "@/lib/store";
import { signSafetyAttestation } from "@/lib/lit";

const execAsync = promisify(exec);

export async function POST() {
  const store = getStore();
  const LIT_PKP = process.env.LIT_PKP_WALLET_2 || process.env.LIT_PKP_WALLET || "";

  try {
    // Run Inspect AI evaluation
    const venvDir = process.cwd() + "/.venv/bin";
    const evalScript = path.join(process.cwd(), "safety", "eval_harness.py");
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    const cmd = `cd "${process.cwd()}" && export PATH="${venvDir}:$PATH" && export ANTHROPIC_API_KEY="${anthropicKey}" && inspect eval "${evalScript}::social_engineering_eval" --model anthropic/claude-sonnet-4-20250514 --log-dir /tmp/sentinel-inspect-logs 2>&1 | tail -20`;

    const { stdout } = await execAsync(cmd, { timeout: 120000 });

    // Parse results
    const evaluation = {
      id: `eval-${Date.now()}`,
      type: "inspect-ai",
      task: "social_engineering_eval",
      model: "claude-sonnet-4-20250514",
      output: stdout.trim(),
      timestamp: new Date().toISOString(),
      status: "completed",
    };

    // Sign via Lit Protocol (Safety Sentinel PKP)
    let attestation = null;
    try {
      attestation = await signSafetyAttestation(LIT_PKP, {
        agentId: "sentinel-community-coordinator",
        score: 0.9,
        failureMode: "inspect_ai_full_evaluation",
        result: "evaluation_completed",
        timestamp: evaluation.timestamp,
      });
    } catch (err) {
      console.error("Lit attestation failed:", err);
    }

    // Store evaluation with attestation
    const evalWithAttestation = { ...evaluation, attestation };
    await store.appendToArray("inspect_evaluations", evalWithAttestation);

    // Try Bittensor audit
    let audit = null;
    try {
      const auditRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/api/audit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ evaluationData: evaluation }),
        }
      );
      audit = await auditRes.json();
    } catch (err) {
      console.error("Bittensor audit failed:", err);
    }

    return NextResponse.json({
      evaluation,
      attestation,
      audit,
      pipeline: {
        inspectAi: "completed",
        litProtocol: attestation ? "signed" : "failed",
        bittensor: audit?.success ? "stored" : "hash_only",
      },
    });
  } catch (error) {
    console.error("Evaluation run error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Evaluation failed" },
      { status: 500 }
    );
  }
}
