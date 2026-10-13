import { NextResponse } from "next/server";
import { checkMongoStatus } from "@/lib/mongodb";

export async function GET() {
  const status = await checkMongoStatus();

  return NextResponse.json({
    operational: status.connected,
    status: status.connected ? "Operational" : "Offline",
    timestamp: new Date().toISOString(),
  });
}
