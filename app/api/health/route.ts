import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export async function GET() {
  try {
    await db.select({ id: users.id }).from(users).limit(1);
    return NextResponse.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      {
        status: "degraded",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
