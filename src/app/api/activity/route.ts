import { NextResponse } from "next/server";
import { getActivities, addActivity } from "@/lib/activity";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const floorId = searchParams.get("floorId");
  const activities = await getActivities(floorId ? Number(floorId) : undefined);
  return NextResponse.json({ activities });
}

export async function POST(req: Request) {
  const body = await req.json();
  const activity = await addActivity(body);
  return NextResponse.json({ activity });
}
