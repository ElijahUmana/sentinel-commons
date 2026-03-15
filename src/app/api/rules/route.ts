import { NextResponse } from "next/server";
import { getAgentRules, addAgentRule } from "@/lib/store";

export async function GET() {
  const rules = await getAgentRules();
  return NextResponse.json({ rules });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.rule || !body.setBy) {
    return NextResponse.json({ error: "rule and setBy required" }, { status: 400 });
  }
  const rule = await addAgentRule(body.rule, body.setBy);
  return NextResponse.json({ rule });
}
