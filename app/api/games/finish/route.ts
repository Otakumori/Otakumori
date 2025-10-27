import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { GAME_FLAGS } from '@/config/games';
import { logger } from '@/app/lib/logger';
import { db } from '@/lib/db';

export const runtime = 'nodejs';
export const maxDuration = 10;

const MAX_TOP = 25;

const BodySchema = z.object({
  game: z.string().min(1),
  score: z.number(),
  durationMs: z.number().optional(),
  stats: z
    .object({
      diff: z.string().optional(),
    })
    .catch({}),
});

type Body = z.infer<typeof BodySchema>;

type LeaderboardEntry = {
  userId: string;
  score: number;
  diff: string | null;
  updatedAt: Date;
};

export async function POST(request: Request) {
  const { userId } = await auth();
  const parsed = BodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'bad_input' }, { status: 400 });
  }

  const body = parsed.data;
  const flags = GAME_FLAGS[body.game as keyof typeof GAME_FLAGS];

  if (!flags?.enabled) {
    return NextResponse.json({ ok: false, error: 'game_disabled' }, { status: 400 });
  }

  if (flags.practice) {
    return NextResponse.json({ ok: true, practice: true });
  }

  const score = clamp(Math.trunc(body.score), 0, 10_000_000);
  const diff = typeof body.stats.diff === 'string' ? body.stats.diff : null;

  if (!userId) {
    return NextResponse.json({ ok: true, guest: true, score });
  }

  const petalsGranted = calculatePetals(body.game, score);

  if (petalsGranted > 0) {
    logger.info('petals_granted', {
      userId: userId || undefined,
      game: body.game,
      score,
      petalsGranted,
    });
    // TODO: integrate with petals ledger + achievements once migrations are stable
  }

  let personalBest = false;

  try {
    const previous = await db.leaderboardScore.findUnique({
      where: {
        userId_game_diff: {
          userId,
          game: body.game,
          diff,
        },
      },
    });

    if (!previous || score > previous.score) {
      await db.leaderboardScore.upsert({
        where: {
          userId_game_diff: {
            userId,
            game: body.game,
            diff,
          },
        },
        create: {
          userId,
          game: body.game,
          diff,
          score,
          statsJson: body.stats ?? {},
        },
        update: {
          score,
          statsJson: body.stats ?? {},
        },
      });

      personalBest = true;
    }
  } catch (error) {
    logger.error('leaderboard upsert error', { extra: { error } });
  }

  const top = await db.leaderboardScore.findMany({
    where: {
      game: body.game,
      ...(diff ? { diff } : {}),
    },
    orderBy: [{ score: 'desc' }, { updatedAt: 'asc' }],
    take: MAX_TOP,
  });

  return NextResponse.json({
    ok: true,
    score,
    petalsGranted,
    personalBest,
    top: top.map(formatLeaderboardEntry),
  });
}

function formatLeaderboardEntry(entry: LeaderboardEntry) {
  return {
    userId: entry.userId,
    score: entry.score,
    diff: entry.diff,
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number) {
  if (inMax === inMin) return outMin;
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function calculatePetals(game: string, score: number) {
  const grants: Record<string, (s: number) => number> = {
    samurai_petal_slice: (s) => clamp(Math.round(mapRange(s, 0, 5000, 5, 35)), 0, 50),
    anime_memory_match: (s) => clamp(Math.round(mapRange(s, 0, 2000, 5, 25)), 0, 30),
    bubble_pop_gacha: (s) => clamp(Math.round(mapRange(s, 0, 1500, 5, 20)), 0, 25),
    rhythm_beat_em_up: (s) => clamp(Math.round(mapRange(s, 0, 8000, 10, 60)), 0, 80),
  };

  return grants[game]?.(score) ?? 0;
}
