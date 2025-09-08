import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireUserId } from "@/app/lib/auth";

const db = new PrismaClient();

export async function POST(_: Request, { params }: { params: { id: string }}) {
  const userId = await requireUserId();

  const body = await _.json();
  const v = body?.vote; // "up" | "down"
  if (v !== "up" && v !== "down") return new NextResponse("Invalid", { status: 400 });

  // one vote per user per stone (idempotent-ish)
  const existing = await db.soapstoneVote.findUnique({ where: { userId_soapstoneId: { userId, soapstoneId: params.id } }}).catch(() => null);
  let delta = 0;
  if (!existing) {
    await db.soapstoneVote.create({ data: { userId, soapstoneId: params.id, vote: v }});
    delta = v === "up" ? 1 : -1;
  } else if (existing.vote !== v) {
    await db.soapstoneVote.update({ where: { userId_soapstoneId: { userId, soapstoneId: params.id }}, data: { vote: v }});
    delta = v === "up" ? 2 : -2; // switched sides
  }
  if (delta !== 0) await db.soapstone.update({ where: { id: params.id }, data: { score: { increment: delta }}});

  return NextResponse.json({ ok: true });
}
