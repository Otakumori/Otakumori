
import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';
import { GameStartRequestSchema } from '@/app/lib/contracts';
import { getGameDef } from '@/app/lib/games';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = GameStartRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 });
    }

    const { gameKey, idempotencyKey } = validationResult.data;

    // Check idempotency
    const existingRun = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingRun) {
      // Return existing run if found
      const existingGameRun = await prisma.gameRun.findFirst({
        where: {
          userId,
          gameKey,
          startedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        orderBy: { startedAt: 'desc' },
      });

      if (existingGameRun) {
        const meta = existingGameRun.meta as any;
        return NextResponse.json({
          ok: true,
          data: {
            runId: existingGameRun.id,
            seed: meta?.seed || Math.floor(Math.random() * 1000000),
            flags: meta?.flags || {},
          },
        });
      }
    }

    // Validate game exists and is enabled
    const gameDef = getGameDef(gameKey);
    if (!gameDef) {
      return NextResponse.json({ ok: false, error: 'Game not found' }, { status: 404 });
    }

    // Check if game is enabled via feature flag
    const isEnabled =
      env[`NEXT_PUBLIC_${gameDef.featureFlagKey.toUpperCase()}` as keyof typeof env] === 'true';
    if (!isEnabled) {
      return NextResponse.json({ ok: false, error: 'Game is currently disabled' }, { status: 403 });
    }

    // Check daily petal limit
    const dailyLimit = parseInt(env.NEXT_PUBLIC_DAILY_PETAL_LIMIT || '500');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayRuns = await prisma.gameRun.aggregate({
      where: {
        userId,
        startedAt: {
          gte: today,
        },
      },
      _sum: {
        rewardPetals: true,
      },
    });

    const todayPetals = todayRuns._sum.rewardPetals || 0;
    if (todayPetals >= dailyLimit) {
      return NextResponse.json({ ok: false, error: 'Daily petal limit reached' }, { status: 429 });
    }

    // Generate seed for deterministic gameplay
    const seed = Math.floor(Math.random() * 1000000);

    // Create game run
    const gameRun = await prisma.gameRun.create({
      data: {
        userId,
        gameKey,
        score: 0,
        rewardPetals: 0,
        meta: {
          seed,
          flags: {
            dailyLimit,
            eventCode: env.NEXT_PUBLIC_EVENT_CODE || 'SPRING_HANAMI',
          },
        },
      },
    });

    // Store idempotency key
    await prisma.idempotencyKey.create({
      data: {
        key: idempotencyKey,
        purpose: `game_start_${gameKey}_${userId}`,
      },
    });

    // Return success response
    const response = {
      ok: true,
      data: {
        runId: gameRun.id,
        seed,
        flags: {
          dailyLimit,
          eventCode: env.NEXT_PUBLIC_EVENT_CODE || 'SPRING_HANAMI',
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Game start error:', error);

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
