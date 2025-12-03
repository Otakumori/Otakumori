import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { GAME_FLAGS } from '@/config/games';
import { logger } from '@/app/lib/logger';
import { db } from '@/lib/db';
import { PetalService } from '@/app/lib/petals';
import { calculateGameReward } from '@/app/config/petalTuning';

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

// Type alias for validated request body
export type GameFinishBody = z.infer<typeof BodySchema>;

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

  const body: GameFinishBody = parsed.data;
  const flags = GAME_FLAGS[body.game as keyof typeof GAME_FLAGS];

  if (!flags?.enabled) {
    return NextResponse.json({ ok: false, error: 'game_disabled' }, { status: 400 });
  }

  if (flags.practice) {
    return NextResponse.json({ ok: true, practice: true });
  }

  const score = clamp(Math.trunc(body.score), 0, 10_000_000);
  const diff = typeof body.stats.diff === 'string' ? body.stats.diff : undefined;

  if (!userId) {
    return NextResponse.json({ ok: true, guest: true, score });
  }

  const playerId = userId;

  // Map legacy game IDs to new game IDs
  const gameIdMap: Record<string, string> = {
    samurai_petal_slice: 'petal-samurai',
    anime_memory_match: 'memory-match',
    bubble_pop_gacha: 'bubble-girl',
    rhythm_beat_em_up: 'petal-storm-rhythm',
  };
  const mappedGameId = gameIdMap[body.game] || body.game;

  // Calculate petal reward using centralized tuning config
  // Default to win=true for legacy compatibility
  const petalAmount = calculateGameReward(mappedGameId, true, score, {
    difficulty: diff,
  });
  let petalsGranted = petalAmount;

  if (petalsGranted > 0) {
    try {
      const petalService = new PetalService();
      const result = await petalService.awardPetals(playerId, {
        type: 'earn',
        amount: petalAmount,
        reason: `Game reward: ${mappedGameId}`,
        source: 'game',
        metadata: {
          gameId: mappedGameId,
          legacyGame: body.game,
          score,
          diff,
        },
      });

      if (result.success) {
        petalsGranted = result.awarded;
        logger.info('petals_granted', {
          userId: playerId,
          game: body.game,
          extra: {
            score,
            petalsGranted: result.awarded,
            newBalance: result.newBalance,
            lifetimePetalsEarned: result.lifetimePetalsEarned,
          },
        });
      } else {
        logger.error('petals_grant_failed', undefined, {
          userId: playerId,
          game: body.game,
          extra: {
            error: result.error,
            dailyCapReached: result.dailyCapReached,
          },
        }, undefined);
        petalsGranted = 0;
      }
    } catch (error) {
      logger.error('petals_grant_error', undefined, {
        userId: playerId,
        game: body.game,
        extra: { error },
      }, undefined);
      petalsGranted = 0;
    }
  }

  let personalBest = false;

  try {
    if (diff) {
      const previous = await db.leaderboardScore.findUnique({
        where: {
          userId_game_diff: {
            userId: playerId,
            game: body.game,
            diff: diff ?? null,
          },
        },
      });

      if (!previous || score > previous.score) {
        await db.leaderboardScore.upsert({
          where: {
            userId_game_diff: {
              userId: playerId,
              game: body.game,
              diff,
            },
          },
          create: {
            userId: playerId,
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
    } else {
      const previous = await db.leaderboardScore.findFirst({
        where: {
          userId: playerId,
          game: body.game,
          diff: null,
        },
      });

      if (!previous || score > previous.score) {
        if (previous) {
          await db.leaderboardScore.update({
            where: { id: previous.id },
            data: {
              score,
              statsJson: body.stats ?? {},
            },
          });
        } else {
          await db.leaderboardScore.create({
            data: {
              userId: playerId,
              game: body.game,
              diff: null,
              score,
              statsJson: body.stats ?? {},
            },
          });
        }

        personalBest = true;
      }
    }
  } catch (error) {
    logger.error('leaderboard upsert error', undefined, { extra: { error } }, undefined);
  }

  const top = await db.leaderboardScore.findMany({
    where: diff
      ? {
          game: body.game,
          diff,
        }
      : {
          game: body.game,
          diff: null,
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
