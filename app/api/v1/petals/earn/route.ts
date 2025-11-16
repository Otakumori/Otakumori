import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PetalService } from '@/app/lib/petals';
import { generateRequestId } from '@/lib/requestId';
import { checkRateLimit, getClientIdentifier } from '@/app/lib/rate-limiting';
import { calculateGameReward } from '@/app/config/petalTuning';

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

// Rate limit config for petal earning (per minute)
const PETAL_EARN_RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 20, // 20 earns per minute
  message: 'Too many petal earning requests. Please wait a moment.',
};

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();

    // Rate limiting
    const identifier = getClientIdentifier(req, userId || undefined);
    const rateLimitResult = await checkRateLimit('PETAL_EARN', identifier, PETAL_EARN_RATE_LIMIT);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'RATE_LIMITED',
          message: rateLimitResult.message,
          requestId,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        },
      );
    }

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
    // Note: localStorage is client-side only, so we can't access it here
    // The client will handle persistence and daily limits
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

    // Authenticated user - award petals via PetalService
    const petalService = new PetalService();
    const result = await petalService.awardPetals(userId, {
      type: 'earn',
      amount: petalAmount,
      reason: `Game reward: ${gameId}`,
      source: 'game',
      metadata: {
        gameId,
        score,
        ...metadata,
      },
    }, requestId);

    if (!result.success) {
      return NextResponse.json(
        {
          ok: false,
          error: result.error || 'Failed to award petals',
          requestId,
          dailyCapReached: result.dailyCapReached || false,
        },
        { status: result.dailyCapReached ? 429 : 500 },
      );
    }

    const response = NextResponse.json({
      ok: true,
      data: {
        earned: result.awarded,
        balance: result.newBalance,
        lifetimePetalsEarned: result.lifetimePetalsEarned,
        isGuest: false,
        source: 'game',
        dailyCapReached: result.dailyCapReached || false,
      },
      requestId,
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    return response;
  } catch (error: any) {
    console.error('[Petals Earn] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error.message, requestId },
      { status: 500 },
    );
  }
}

