import { NextResponse } from "next/server";
import { log } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET() {
  try {
    log("health_check", { timestamp: new Date().toISOString() });
    return NextResponse.json({ 
      ok: true, 
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    log("health_check_error", { message: String(e) });
    return NextResponse.json({ 
      ok: false, 
      status: "unhealthy",
      error: String(e)
    }, { status: 500 });
  }
}
