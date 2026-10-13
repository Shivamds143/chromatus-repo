import { NextResponse } from "next/server";
import { getDatabase, checkMongoStatus } from "@/lib/mongodb";
import { syncFallbackToMongo } from "@/lib/storage-fallback";

export async function POST() {
  const status = await checkMongoStatus();
  if (!status.connected) {
    return NextResponse.json(
      { ok: false, error: "Cannot sync: MongoDB is not connected." },
      { status: 400 }
    );
  }

  try {
    const db = await getDatabase();
    const result = await syncFallbackToMongo(db);
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Sync failed" },
      { status: 500 }
    );
  }
}
