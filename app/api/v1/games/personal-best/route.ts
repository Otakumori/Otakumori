import { NextResponse, type NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  isMissingSchemaError,
  requireLocalViewer,
  schemaUnavailableResponse,
} from '@/app/lib/auth/viewer';
import { logger } from '@/app/lib/logger';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';

const LAUNCH_GAME_IDS = [
  'otaku-beat-em-up',
  'petal-storm-rhythm',
  'memory-match',
  'petal-samurai',
  'blossomware',
  'bubble-ragdoll',
  'puzzle-reveal',
  'thigh-coliseum',
  'dungeon-of-desire',
  'maid-cafe-manager',
] as const;

const PersonalBestSchema = z.object({
  gameId: z.enum(LAUNCH_GAME_IDS),
  resultKey: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9:_-]+$/),
  score: z.number().int().nonnegative(),
  metadata: z.record(z.unknown()).optional(),
});

async function findBest(userId: string, gameId: string, resultKey: string) {
  return db.leaderboardScore.findFirst({
    where: { userId, game: gameId, diff: resultKey },
    select: { id: true, score: true },
  });
}

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const viewer = await requireLocalViewer();
    const parsed = PersonalBestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', requestId },
        { status: 400 },
      );
    }

    const { gameId, resultKey, score, metadata } = parsed.data;
    const statsJson = (metadata ?? {}) as Prisma.InputJsonValue;
    const previous = await findBest(viewer.localUserId, gameId, resultKey);
    let previousBest = previous?.score ?? null;

    if (previous) {
      if (score > previous.score) {
        await db.leaderboardScore.updateMany({
          where: { id: previous.id, score: { lt: score } },
          data: { score, statsJson },
        });
      }
    } else {
      try {
        await db.leaderboardScore.create({
          data: {
            userId: viewer.localUserId,
            game: gameId,
            diff: resultKey,
            score,
            statsJson,
          },
        });
      } catch (error) {
        // A concurrent completion may have created the same compound key first.
        // Retrying as a guarded max-update keeps score storage monotonic.
        const concurrent = await findBest(viewer.localUserId, gameId, resultKey);
        if (!concurrent) throw error;
        previousBest = concurrent.score;
        await db.leaderboardScore.updateMany({
          where: { id: concurrent.id, score: { lt: score } },
          data: { score, statsJson },
        });
      }
    }

    const current = await findBest(viewer.localUserId, gameId, resultKey);
    if (!current) throw new Error('Personal best was not persisted');

    return NextResponse.json({
      ok: true,
      data: {
        gameId,
        resultKey,
        submittedScore: score,
        previousBest,
        currentBest: current.score,
        isNewBest: current.score === score && (previousBest === null || score > previousBest),
        persisted: true,
      },
      requestId,
    });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }
    if (error instanceof LocalUserUnavailableError || isMissingSchemaError(error)) {
      return NextResponse.json(schemaUnavailableResponse(requestId), { status: 503 });
    }

    logger.error('personal_best_persistence_failed', { requestId }, { error });
    return NextResponse.json(
      { ok: false, error: 'PERSONAL_BEST_UNAVAILABLE', requestId },
      { status: 500 },
    );
  }
}
