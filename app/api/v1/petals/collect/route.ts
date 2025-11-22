import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateRequestId } from '@/lib/requestId';
import { grantPetals } from '@/app/lib/petals/grant';
import { logger } from '@/app/lib/logger';

export const runtime = 'nodejs';

const CollectPetalsSchema = z.object({
  amount: z.number().int().positive().max(500),
  source: z.enum(['homepage_collection', 'game_reward', 'daily_bonus', 'achievement']),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    const body = await req.json();
    const validation = CollectPetalsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', details: validation.error.issues, requestId },
        { status: 400 },
      );
    }

    const { amount, source, metadata } = validation.data;

    // Map legacy source names to new PetalSource types
    const sourceMap: Record<
      string,
      'background_petal_click' | 'mini_game' | 'daily_login' | 'achievement'
    > = {
      homepage_collection: 'background_petal_click',
      game_reward: 'mini_game',
      daily_bonus: 'daily_login',
      achievement: 'achievement',
    };

    const mappedSource = sourceMap[source] || 'other';

    // Use centralized grantPetals function
    const result = await grantPetals({
      userId: userId || null,
      amount,
      source: mappedSource,
      metadata,
      description: `Collected ${amount} petals from ${source}`,
      requestId,
      req,
    });

    if (!result.success) {
      const statusCode =
        result.errorCode === 'RATE_LIMITED'
          ? 429
          : result.errorCode === 'AUTH_REQUIRED'
            ? 401
            : result.errorCode === 'VALIDATION_ERROR'
              ? 400
              : 500;

      return NextResponse.json(
        {
          ok: false,
          error: result.errorCode || 'INTERNAL_ERROR',
          message: result.error,
          requestId,
        },
        { status: statusCode },
      );
    }

    // Guest user handling - return early for guests
    if (!userId) {
      return NextResponse.json({
        ok: true,
        data: {
          balance: null,
          earned: result.granted,
          guestPetals: result.granted,
          isGuest: true,
        },
        requestId,
      });
    }

    // For authenticated users, return full result
    return NextResponse.json({
      ok: true,
      data: {
        balance: result.newBalance,
        earned: result.granted,
        lifetimeEarned: result.lifetimeEarned,
        limited: result.limited || false,
        dailyRemaining: result.dailyRemaining,
        isGuest: false,
      },
      requestId,
    });
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('[Petals Collect] Error', { requestId }, new Error(errorMessage));

    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: error.message || 'Failed to collect petals',
        requestId,
      },
      { status: 500 },
    );
  }
}
