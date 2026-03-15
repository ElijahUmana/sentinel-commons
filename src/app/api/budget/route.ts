import { NextResponse } from "next/server";
import { getBudgetSummary, addTransaction } from "@/lib/budget";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const floorId = Number(searchParams.get("floorId") || "9");
  const summary = await getBudgetSummary(floorId);
  return NextResponse.json(summary);
}

export async function POST(req: Request) {
  const body = await req.json();
  const tx = await addTransaction(body);
  return NextResponse.json({ transaction: tx });
}
