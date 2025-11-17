import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateRequestId } from '@/lib/requestId';
import { grantPetals, type PetalSource } from '@/app/lib/petals/grant';
import { logger } from '@/app/lib/logger';

export const runtime = 'nodejs';

const GrantPetalsSchema = z.object({
  amount: z.number().int().positive().max(1000),
  source: z.enum([
    'mini_game',
    'background_petal_click',
    'purchase_reward',
    'daily_login',
    'achievement',
    'admin_grant',
    'quest_reward',
    'soapstone_praise',
    'leaderboard_reward',
    'other',
  ]),
  metadata: z.record(z.unknown()).optional(),
  description: z.string().optional(),
});

/**
 * POST /api/v1/petals/grant
 * 
 * Centralized endpoint for granting petals.
 * All petal grants should use this endpoint to ensure:
 * - Consistent validation
 * - Rate limiting
 * - Daily caps
 * - Proper logging
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    const body = await req.json();
    const validation = GrantPetalsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'VALIDATION_ERROR',
          details: validation.error.issues,
          requestId,
        },
        { status: 400 },
      );
    }

    const { amount, source, metadata, description } = validation.data;

    // Grant petals using centralized function
    const result = await grantPetals({
      userId: userId || null,
      amount,
      source: source as PetalSource,
      metadata,
      description,
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

    // Return success response
    return NextResponse.json(
      {
        ok: true,
        data: {
          granted: result.granted,
          newBalance: result.newBalance,
          lifetimeEarned: result.lifetimeEarned,
          limited: result.limited || false,
          dailyRemaining: result.dailyRemaining,
        },
        requestId,
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('[Petals Grant API] Error', { requestId }, new Error(errorMessage));

    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: 'Failed to grant petals',
        requestId,
      },
      { status: 500 },
    );
  }
}

