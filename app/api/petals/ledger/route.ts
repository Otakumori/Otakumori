/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { NextResponse } from "next/server";
import { requireUserId } from "@/app/lib/auth";
import { getPetalLedger } from "@/app/lib/petals";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 10;

const Q = z.object({
  limit: z.string().optional(),
  cursor: z.string().nullable().optional(),
  type: z.enum(["ALL","EARN","SPEND","ADJUST"]).optional(),
});

export async function GET(req: Request) {
  try {
    const userId = requireUserId();
    const url = new URL(req.url);
    const parsed = Q.parse({
      limit: url.searchParams.get("limit") ?? undefined,
      cursor: url.searchParams.get("cursor"),
      type: url.searchParams.get("type") ?? "ALL",
    });

      const { items, nextCursor } = await getPetalLedger({
    userId,
    limit: parsed.limit ? Number(parsed.limit) : 25,
    cursor: parsed.cursor ?? null,
    type: parsed.type === "EARN" ? "earn" : parsed.type === "SPEND" ? "spend" : parsed.type === "ADJUST" ? "adjust" : "ALL",
  });

    return NextResponse.json({ ok: true, items, nextCursor });
  } catch (e: any) {
    const status = e?.status ?? 400;
    return NextResponse.json({ ok: false, error: String(e.message ?? e) }, { status });
  }
}
