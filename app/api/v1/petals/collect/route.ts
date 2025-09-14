import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { collectPetalsReq } from '@/lib/schemas/petals';
import { problem } from '@/lib/http/problem';
import { prisma } from '@/app/lib/prisma';
import { creditPetals, ensureUserByClerkId } from '@/lib/petals';
import { rateLimit } from '@/app/api/rate-limit';

export const runtime = 'nodejs';

function startOfUTCDay(d = new Date()) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json(problem(401, 'Unauthorized'));

  const body = await request.json().catch(() => null);
  const parsed = collectPetalsReq.safeParse(body);
  if (!parsed.success) return NextResponse.json(problem(400, 'Invalid request'));
  const { source, amount } = parsed.data;

  // Rate limit
  const rl = await rateLimit(request, { windowMs: 10_000, maxRequests: 10, keyPrefix: 'petals:collect' }, userId);
  if (rl.limited) return NextResponse.json(problem(429, 'Rate limit exceeded'));

  // Daily caps
  const dailyCap = parseInt(process.env.NEXT_PUBLIC_DAILY_PETAL_LIMIT || '500', 10);
  const perSourceCap: Record<string, number> = {
    'clicker': 120,
    'mini-game:petal-run': 500,
    'mini-game:memory': 500,
    'mini-game:rhythm': 500,
    'admin': 2000,
    'purchase': 10000,
  };
  const srcCap = perSourceCap[source] ?? dailyCap;

  const user = await ensureUserByClerkId(userId);
  const since = startOfUTCDay();
  const [earnedTodayAll, earnedTodaySrc] = await Promise.all([
    prisma.petalLedger.aggregate({
      where: { userId: user.id, type: 'earn', createdAt: { gte: since } },
      _sum: { amount: true },
    }),
    prisma.petalLedger.aggregate({
      where: { userId: user.id, type: 'earn', createdAt: { gte: since }, reason: { startsWith: `source:${source}` } },
      _sum: { amount: true },
    }),
  ]);
  const usedAll = earnedTodayAll._sum.amount || 0;
  const usedSrc = earnedTodaySrc._sum.amount || 0;
  const leftAll = Math.max(0, dailyCap - usedAll);
  const leftSrc = Math.max(0, srcCap - usedSrc);
  const grant = Math.min(amount, leftAll, leftSrc);

  if (grant <= 0) return NextResponse.json(problem(429, 'Daily cap reached'));

  const res = await creditPetals(userId, grant, `source:${source}`);
  return NextResponse.json({ ok: true, granted: grant, balance: res.balance, remainingToday: leftAll - grant });
}
