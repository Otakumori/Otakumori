import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';

const CollectPetalsSchema = z.object({
  amount: z.number().int().positive().max(500),
  source: z.enum(['homepage_collection', 'game_reward', 'daily_bonus', 'achievement']),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const body = await req.json();
    const validation = CollectPetalsSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', details: validation.error.errors, requestId },
        { status: 400 },
      );
    }

    const { amount, source } = validation.data;

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

    return NextResponse.json({
      ok: true,
      data: {
        balance: result.wallet.balance,
        earned: amount,
        streakBonus: result.streakBonus,
        currentStreak: result.wallet.currentStreak,
        transactionId: result.transaction.id,
      },
      requestId,
    });
  } catch (error: any) {
    console.error('[Petals Collect] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error.message, requestId },
      { status: 500 },
    );
  }
}
