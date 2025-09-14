import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { requireUserId } from "@/app/lib/auth";
import { rateLimit } from "@/app/api/rate-limit";
import { sanitizeSoapstone } from "@/lib/sanitize";
import { problem } from "@/lib/http/problem";

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

export async function POST(req: NextRequest) {
  const userId = await requireUserId();
  const rl = await rateLimit(req, { windowMs: 30_000, maxRequests: 6, keyPrefix: 'soapstone:post' }, userId);
  if (rl.limited) return NextResponse.json(problem(429, 'Rate limit exceeded'), { status: 429 });

  const body = await req.json().catch(() => null) as any;
  const raw = typeof body?.text === 'string' ? body.text : '';
  let text = sanitizeSoapstone(raw);
  if (!text || text.length > 140) return NextResponse.json(problem(400, 'Invalid text'));

  const created = await db.soapstone.create({ data: { userId, text, score: 0 }});
  return NextResponse.json({ ok: true, id: created.id });
}
