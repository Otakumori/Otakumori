import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/lib/requestId';
import { checkRateLimit, getClientIdentifier } from '@/app/lib/rate-limiting';

export const runtime = 'nodejs';

const CollectPetalsSchema = z.object({
  amount: z.number().int().positive().max(500),
  source: z.enum(['homepage_collection', 'game_reward', 'daily_bonus', 'achievement']),
});

// Rate limit config for petal collection (per minute)
const PETAL_COLLECT_RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 10, // 10 collects per minute
  message: 'Too many petal collections. Please wait a moment.',
};

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    
    // Rate limiting for both authenticated and guest users
    const identifier = getClientIdentifier(req, userId || undefined);
    const rateLimitResult = await checkRateLimit('PETAL_COLLECT', identifier, PETAL_COLLECT_RATE_LIMIT);
    
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
    const validation = CollectPetalsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', details: validation.error.issues, requestId },
        { status: 400 },
      );
    }

    const { amount, source } = validation.data;

    // Guest user handling
    if (!userId) {
      // For guest users, return a response that client can use for localStorage
      return NextResponse.json({
        ok: true,
        data: {
          balance: null, // Client will handle localStorage
          earned: amount,
          guestPetals: amount,
          isGuest: true,
        },
        requestId,
      });
    }

    // Check daily limit for homepage collection
    if (source === 'homepage_collection') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayCollected = await db.petalTransaction.aggregate({
        where: {
          userId,
          source: 'homepage_collection',
          createdAt: { gte: today },
        },
        _sum: { amount: true },
      });

      const collectedToday = todayCollected._sum.amount || 0;
      const dailyLimit = 1000; // 1000 petals per day from homepage

      if (collectedToday + amount > dailyLimit) {
        return NextResponse.json(
          {
            ok: false,
            error: 'DAILY_LIMIT_REACHED',
            message: `Daily limit of ${dailyLimit} petals reached`,
            requestId,
          },
          { status: 429 },
        );
      }
    }

    // Use transaction to update wallet and create transaction record
    const result = await db.$transaction(async (tx) => {
      // Upsert petal wallet
      const wallet = await tx.petalWallet.upsert({
        where: { userId },
        create: {
          userId,
          balance: amount,
          lifetimeEarned: amount,
          lastCollectedAt: new Date(),
        },
        update: {
          balance: { increment: amount },
          lifetimeEarned: { increment: amount },
          lastCollectedAt: new Date(),
        },
      });

      // Create transaction record
      const transaction = await tx.petalTransaction.create({
        data: {
          userId,
          amount,
          source,
          description: `Collected ${amount} petals from ${source}`,
        },
      });

      // Check for streak bonus
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayCollection = await tx.petalTransaction.findFirst({
        where: {
          userId,
          source: 'homepage_collection',
          createdAt: { gte: yesterday },
        },
      });

      let streakBonus = 0;
      if (yesterdayCollection) {
        // Update streak
        await tx.petalWallet.update({
          where: { userId },
          data: { currentStreak: { increment: 1 } },
        });
        streakBonus = Math.floor(amount * 0.1); // 10% streak bonus
      } else {
        // Reset streak
        await tx.petalWallet.update({
          where: { userId },
          data: { currentStreak: 1 },
        });
      }

      return { wallet, transaction, streakBonus };
    });

    const response = NextResponse.json({
      ok: true,
      data: {
        balance: result.wallet.balance,
        earned: amount,
        streakBonus: result.streakBonus,
        currentStreak: result.wallet.currentStreak,
        transactionId: result.transaction.id,
        isGuest: false,
      },
      requestId,
    });

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', rateLimitResult.limit.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', rateLimitResult.resetTime.toString());

    return response;
  } catch (error: any) {
    console.error('[Petals Collect] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error.message, requestId },
      { status: 500 },
    );
  }
}
