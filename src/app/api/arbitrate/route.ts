import { NextResponse } from "next/server";
import { arbitrate } from "@/lib/safety-arbiter";

export async function POST(req: Request) {
  try {
    const { escrowUid, agentId, escrowCreatedAt } = await req.json();

    if (!escrowUid || !agentId) {
      return NextResponse.json({ error: "escrowUid and agentId required" }, { status: 400 });
    }

    const decision = await arbitrate(
      escrowUid,
      agentId,
      escrowCreatedAt || new Date(Date.now() - 86400000).toISOString()
    );

    return NextResponse.json({
      decision,
      arbiterType: "SafetyArbiter",
      description: "Novel arbiter that checks agent safety before releasing escrow payment. Agents that behave deceptively don't get paid.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Arbitration failed" },
      { status: 500 }
    );
  }
}
