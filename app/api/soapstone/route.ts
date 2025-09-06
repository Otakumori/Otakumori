// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const createSchema = z.object({
  postId: z.string().optional(),
  text: z.string().min(1).max(2800),
  overlayURL: z.string().url().optional(),
  x: z.number().int().optional(),
  y: z.number().int().optional(),
});

import { env } from '@/env';

const redis = env.UPSTASH_REDIS_REST_URL
  ? new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN })
  : null;

const limiter = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(12, '1 m') }) : null;

const banned = [' slur1 ', ' slur2 ', ' slur3 '];
const sanitize = (raw: string) => raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
const violates = (s: string) => {
  const padded = ` ${s.toLowerCase()} `;
  return banned.some(term => padded.includes(term));
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get('postId') || undefined;
  const messages = await db.soapstoneMessage.findMany({
    where: { status: 'PUBLIC', ...(postId ? { postId } : {}) },
    orderBy: { createdAt: 'desc' }, take: 100,
  });
  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (limiter) {
    const ok = await limiter.limit(`soapstone:${userId}`);
    if (!ok.success) return NextResponse.json({ error: 'Slow down' }, { status: 429 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 });

  const text = sanitize(parsed.data.text);
  if (violates(text)) return NextResponse.json({ error: 'Message rejected' }, { status: 400 });

  // Ensure authorId is a valid field in the Prisma schema for SoapstoneMessage.
  // If not, add it as: authorId String in your Prisma model and run a migration.
  const message = await db.soapstoneMessage.create({
    data: {
      postId: parsed.data.postId,
      text,
      overlayURL: parsed.data.overlayURL,
      x: parsed.data.x,
      y: parsed.data.y,
      authorId: userId, // authorId must exist in the Prisma model
    },
  });

  return NextResponse.json({ message });
}
