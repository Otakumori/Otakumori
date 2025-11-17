import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

import { rateLimit } from '@/app/api/rate-limit';
import { logger } from '@/app/lib/logger';
import { db } from '@/lib/db';
import { problem } from '@/lib/http/problem';
import { reqId } from '@/lib/log';
import { calculateGameReward } from '@/app/config/petalTuning';
import { submitScoreReq } from '@/lib/schemas/minigames';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  const requestId = reqId(req.headers);
  logger.request(req, 'POST /api/mini-games/submit');

  const { userId } = await auth();

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    logger.error('mini-game submit JSON parse failed', { requestId }, { error });
    return NextResponse.json(problem(400, 'Invalid request'), { status: 400 });
  }

  const parsed = submitScoreReq.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(problem(400, 'Invalid request'), { status: 400 });
  }

  const { score, game } = parsed.data;

  if (!userId) {
    const data: Parameters<typeof upsertLeaderboardScore>[0] = { userId: 'guest', game, score };
    if (requestId) {
      data.requestId = requestId;
    }
    await upsertLeaderboardScore(data);
    return NextResponse.json({ ok: true, score, petalsGranted: 0 });
  }

  const limit = await rateLimit(
    req,
    { windowMs: 60_000, maxRequests: 6, keyPrefix: 'mg:submit' },
    `${userId}:${game}`,
  );

  if (limit.limited) {
    return NextResponse.json(problem(429, 'Rate limit exceeded'), { status: 429 });
  }

  const scoreData: Parameters<typeof upsertLeaderboardScore>[0] = { userId, game, score };
  if (requestId) {
    scoreData.requestId = requestId;
  }
  await upsertLeaderboardScore(scoreData);

  // Calculate petal reward using centralized tuning config
  // Map legacy game names to new game IDs
  const gameIdMap: Record<string, string> = {
    'petal-run': 'petal-samurai',
    'memory': 'memory-match',
    'rhythm': 'petal-storm-rhythm',
  };
  const mappedGameId = gameIdMap[game] || game;
  
  // Default to win=true for legacy compatibility
  const petalAmount = calculateGameReward(mappedGameId, true, score, {});
  let petalsGranted = petalAmount;
  let balance: number | undefined;
  let lifetimePetalsEarned: number | undefined;

  if (petalsGranted > 0) {
    try {
      // Use centralized grantPetals function
      const { grantPetals } = await import('@/app/lib/petals/grant');
      const result = await grantPetals({
        userId,
        amount: petalAmount,
        source: 'mini_game',
        metadata: {
          gameId: mappedGameId,
          legacyGame: game,
          score,
        },
        description: `Game reward: ${mappedGameId}`,
        requestId,
        req,
      });

      if (result.success) {
        petalsGranted = result.granted;
        balance = result.newBalance;
        lifetimePetalsEarned = result.lifetimeEarned;
      } else {
        logger.error(
          'petals_award_error',
          { requestId: requestId || undefined, userId, game },
          new Error(result.error || 'Failed to award petals'),
        );
        petalsGranted = 0;
      }
    } catch (error) {
      logger.error(
        'petals_award_error',
        { requestId: requestId || undefined, userId, game },
        { error },
      );
      petalsGranted = 0;
    }
  }

  return NextResponse.json({
    ok: true,
    score,
    petalsGranted,
    ...(balance !== undefined ? { balance } : {}),
    ...(lifetimePetalsEarned !== undefined ? { lifetimePetalsEarned } : {}),
    requestId,
  });
}

async function upsertLeaderboardScore({
  userId,
  game,
  score,
  requestId,
}: {
  userId: string;
  game: string;
  score: number;
  requestId?: string | undefined;
}) {
  try {
    const previous = await db.leaderboardScore.findFirst({
      where: { userId, game, diff: null },
      select: { id: true, score: true },
    });

    if (!previous) {
      await db.leaderboardScore.create({
        data: { userId, game, diff: null, score, statsJson: {} },
      });
      return;
    }

    if (score > previous.score) {
      await db.leaderboardScore.update({
        where: { id: previous.id },
        data: { score },
      });
    }
  } catch (error) {
    logger.error('leaderboard_upsert_error', { requestId, userId, game }, { error });
  }
}
