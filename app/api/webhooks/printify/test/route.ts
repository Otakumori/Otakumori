/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextResponse } from "next/server";
export const runtime = "nodejs";

export async function POST() {
  // Minimal fake payload to test handler pipeline
  const example = { type: "order:created", data: { id: "test_order_id" } };
  return NextResponse.json({ ok: true, example });
}
