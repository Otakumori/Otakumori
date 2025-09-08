import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireUserId } from "@/app/lib/auth";

const db = new PrismaClient();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(20, Number(searchParams.get("take") ?? 10));
  const skip = Math.max(0, Number(searchParams.get("skip") ?? 0));
  const items = await db.soapstone.findMany({
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take, skip
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const userId = await requireUserId();
  const { text } = await req.json();
  if (typeof text !== "string" || !text.trim() || text.length > 140) return new NextResponse("Invalid text", { status: 400 });
  // No emojis
  if (/[\p{Extended_Pictographic}]/u.test(text)) return new NextResponse("Invalid characters", { status: 400 });

  const created = await db.soapstone.create({ data: { userId, text, score: 0 }});
  return NextResponse.json({ ok: true, id: created.id });
}