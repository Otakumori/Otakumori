/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextResponse } from "next/server";
import { requireUserId } from "@/app/lib/auth";
import { writePetalTxn } from "@/app/lib/petals";
import { LedgerType } from "@prisma/client";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(req: Request) {
  try {
    const userId = requireUserId();
    const { amount, reason, metadata } = await req.json();

    const nextBalance = await writePetalTxn({
      userId,

      type: LedgerType.earn,
      amount: Number(amount),
      reason: reason ?? "PETAL_CLICK",
      metadata,
    });

    return NextResponse.json({ ok: true, petals: nextBalance });
  } catch (e: any) {
    const status = e?.status ?? 400;
    return NextResponse.json({ ok: false, error: String(e.message ?? e) }, { status });
  }
}
