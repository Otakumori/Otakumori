 
 
export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextResponse } from 'next/server';
import { log } from '@/lib/logger';
import { prisma } from '@/app/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { GAME_FLAGS } from '@/config/games';

type LeaderboardScore = {
  id: string;
  userId: string;
  game: string;
  diff: string | null;
  score: number;
  statsJson: any;
  createdAt: Date;
  updatedAt: Date;
};

type Body = {
  game: string;
  score: number;
  durationMs?: number;
  stats?: any; // e.g., { diff?: "easy"|"normal"|"hard"|"insane", ... }
};

const MAX_TOP = 25;

export async function POST(req: Request) {
  const { userId } = auth();
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.game || typeof body.score !== 'number') {
    return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 });
  }

  // clamp score defensively
  const score = Math.max(0, Math.min(body.score | 0, 10_000_000));
  const game = String(body.game);
  const diff = typeof body.stats?.diff === 'string' ? body.stats.diff : null;

  // Check game flags
  const flags = GAME_FLAGS[game as keyof typeof GAME_FLAGS];
  if (!flags?.enabled) {
    return NextResponse.json({ ok: false, error: 'game_disabled' }, { status: 400 });
  }
  if (flags.practice) {
    // Practice mode: don't grant petals/achievements/leaderboard
    return NextResponse.json({ ok: true, practice: true });
  }

  // Guest users can play but won't get economy rewards
  if (!userId) {
    return NextResponse.json({ ok: true, guest: true });
  }

  // Economy: grant petals and unlock achievements based on game + score
  // NOTE: Replace placeholders with your existing prisma PetalLedger/Achievement logic
  let petalsGranted = 0;
  const grants: Record<string, (s: number) => number> = {
    samurai_petal_slice: (s) => clamp(mapRange(s, 0, 5000, 5, 35), 0, 50),
    anime_memory_match: (s) => clamp(mapRange(s, 0, 2000, 5, 25), 0, 30),
    bubble_pop_gacha: (s) => clamp(mapRange(s, 0, 1500, 5, 20), 0, 25),
    rhythm_beat_em_up: (s) => clamp(mapRange(s, 0, 8000, 10, 60), 0, 80),
  };
  try {
    petalsGranted = Math.round((grants[game] ?? (() => 0))(score));
    if (petalsGranted > 0) {
      // await prisma.petalLedger.create({ data: { userId, amount: petalsGranted, kind: "earn", reason: `game:${game}` } });
      log('petals_granted', { userId, game, score, petalsGranted });
    }
    // Special Samurai cheevos (examples)
    // if (game === "samurai_petal_slice" && score >= 4000) await unlock("zen_is_a_lie");
    // if (game === "samurai_petal_slice" && body.stats?.noHit) await unlock("dont_touch_my_petals");
  } catch (e) {
    log('finish_grant_error', { message: String(e) });
  }

  // Save personal best (if authed)
  let newPersonalBest = false;
  if (userId) {
    try {
      const prev = await prisma.leaderboardScore.findUnique({
        where: { userId_game_diff: { userId, game, diff } },
      });
      if (!prev || score > prev.score) {
        await prisma.leaderboardScore.upsert({
          where: { userId_game_diff: { userId, game, diff } },
          create: { userId, game, diff, score, statsJson: body.stats ?? {} },
          update: { score, statsJson: body.stats ?? {} },
        });
        newPersonalBest = true;
      }
    } catch (e) {
      console.error('leaderboard upsert error', e);
    }
  }

  // Top board slice (public)
  const top = await prisma.leaderboardScore.findMany({
    where: { game, ...(diff ? { diff } : {}) },
    orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
    take: MAX_TOP,
  });

  return NextResponse.json({
    ok: true,
    score,
    petalsGranted,
    personalBest: newPersonalBest,
    top: top.map((t: LeaderboardScore) => ({
      userId: t.userId,
      score: t.score,
      diff: t.diff,
      when: t.updatedAt,
    })),
  });
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}
function mapRange(n: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) return outMin;
  const t = (n - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}
