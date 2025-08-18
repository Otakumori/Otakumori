import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function GET() {
  return NextResponse.json({
    ok: true,
    data: {
      message: "Shop test connection endpoint - implementation pending"
    }
  });
}
