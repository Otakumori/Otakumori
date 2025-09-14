import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { submitScoreReq } from '@/lib/schemas/minigames';
import { problem } from '@/lib/http/problem';
import { prisma } from '@/app/lib/prisma';
import { creditPetals } from '@/lib/petals';
import { rateLimit } from '@/app/api/rate-limit';

export const runtime = 'nodejs';
export const maxDuration = 10;

function calcAward(game: string, score: number): number {
  const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
  // Simple, conservative mapping per game
  switch (game) {
    case 'petal-run':
      return clamp(Math.floor(score / 10), 0, 50);
    case 'memory':
      return clamp(Math.floor(score / 20), 0, 30);
    case 'rhythm':
      return clamp(Math.floor(score / 12), 0, 60);
    default:
      return 0;
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  const body = await req.json().catch(() => null);
  const parsed = submitScoreReq.safeParse(body);
  if (!parsed.success) return NextResponse.json(problem(400, 'Invalid request'));

  const { runId, game, score } = parsed.data;

  // Allow guests: record leaderboard only; no economy
  if (!userId) {
    try {
      const prev = await prisma.leaderboardScore.findFirst({ where: { userId: 'guest', game, diff: null } });
      if (prev) {
        await prisma.leaderboardScore.update({ where: { id: prev.id }, data: { score } });
      } else {
        await prisma.leaderboardScore.create({ data: { userId: 'guest', game, diff: null, score, statsJson: {} } });
      }
    } catch {}
    return NextResponse.json({ ok: true, score, petalsGranted: 0 });
  }

  // Rate limit submissions
  const rl = await rateLimit(req, { windowMs: 60_000, maxRequests: 6, keyPrefix: 'mg:submit' }, userId);
  if (rl.limited) return NextResponse.json(problem(429, 'Rate limit exceeded'));

  // Persist personal best and award petals
  let petalsGranted = calcAward(game, score);
  try {
    // Personal best update
    const prev = await prisma.leaderboardScore.findFirst({ where: { userId, game, diff: null }, select: { id: true, score: true } });
    if (!prev) {
      await prisma.leaderboardScore.create({ data: { userId, game, diff: null, score, statsJson: {} } });
    } else if (score > (prev.score ?? 0)) {
      await prisma.leaderboardScore.update({ where: { id: prev.id }, data: { score } });
    }
  } catch {}

  // Award petals with server-side clamp
  let balance: number | undefined = undefined;
  if (petalsGranted > 0) {
    try {
      const res = await creditPetals(userId, petalsGranted, `mini-game:${game}`);
      balance = res.balance;
    } catch {
      petalsGranted = 0; // if economy fails, don't report grant
    }
  }

  return NextResponse.json({ ok: true, score, petalsGranted, ...(balance != null ? { balance } : {}) });
}
