import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateRequestId } from '@/lib/requestId';
import { grantPetals } from '@/app/lib/petals/grant';
import { calculateGameReward } from '@/app/config/petalTuning';
import { logger } from '@/app/lib/logger';

export const runtime = 'nodejs';

const EarnPetalsSchema = z.object({
  gameId: z.string().min(1),
  score: z.number().int().nonnegative(),
  didWin: z.boolean().optional(), // Whether player won/completed the run
  metadata: z
    .object({
      difficulty: z.string().optional(),
      mode: z.string().optional(),
      combo: z.number().optional(),
      wavesCleared: z.number().optional(),
      accuracy: z.number().optional(),
      timeElapsed: z.number().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    const body = await req.json();
    const validation = EarnPetalsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', details: validation.error.issues, requestId },
        { status: 400 },
      );
    }

    const { gameId, score, didWin, metadata } = validation.data;

    // Calculate petal reward using tuned config
    // Default to win=true if not specified (for backward compatibility)
    const petalAmount = calculateGameReward(gameId, didWin ?? true, score, metadata);

    // Guest user handling - return success, client handles localStorage persistence
    if (!userId) {
      return NextResponse.json({
        ok: true,
        data: {
          earned: petalAmount,
          balance: null, // Client will calculate from localStorage
          lifetimePetalsEarned: null, // Client will calculate from localStorage
          isGuest: true,
          source: 'game',
        },
        requestId,
      });
    }

    // Use centralized grantPetals function
    const result = await grantPetals({
      userId,
      amount: petalAmount,
      source: 'mini_game',
      metadata: {
        gameId,
        score,
        didWin: didWin ?? true,
        ...metadata,
      },
      description: `Game reward: ${gameId}`,
      requestId,
      req,
    });

    if (!result.success) {
      const statusCode =
        result.errorCode === 'RATE_LIMITED'
          ? 429
          : result.errorCode === 'VALIDATION_ERROR'
            ? 400
            : 500;

      return NextResponse.json(
        {
          ok: false,
          error: result.errorCode || 'INTERNAL_ERROR',
          message: result.error,
          requestId,
          dailyCapReached: result.errorCode === 'DAILY_LIMIT_REACHED',
        },
        { status: statusCode },
      );
    }

    return NextResponse.json({
      ok: true,
      data: {
        earned: result.granted,
        balance: result.newBalance,
        lifetimePetalsEarned: result.lifetimeEarned,
        isGuest: false,
        source: 'game',
        dailyCapReached: result.limited || false,
        dailyRemaining: result.dailyRemaining,
      },
      requestId,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('[Petals Earn] Error', { requestId }, new Error(errorMessage));

    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: errorMessage, requestId },
      { status: 500 },
    );
  }
}
