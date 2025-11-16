/**
 * Purchase a discount reward with petals
 * Creates a CouponGrant from a DiscountReward template
 */

import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { PetalService } from '@/app/lib/petals';
import { generateRequestId } from '@/lib/requestId';
import { logger } from '@/app/lib/logger';

export const runtime = 'nodejs';

const PurchaseSchema = z.object({
  discountRewardId: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized', requestId },
        { status: 401 },
      );
    }

    const body = await req.json();
    const validation = PurchaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'Validation error', details: validation.error.issues, requestId },
        { status: 400 },
      );
    }

    const { discountRewardId, idempotencyKey } = validation.data;

    // Check idempotency
    const existingKey = await db.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingKey) {
      return NextResponse.json(
        { ok: false, error: 'Duplicate request', requestId },
        { status: 409 },
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found', requestId },
        { status: 404 },
      );
    }

    // Get discount reward
    const discountReward = await db.discountReward.findUnique({
      where: { id: discountRewardId },
    });

    if (!discountReward) {
      return NextResponse.json(
        { ok: false, error: 'Discount reward not found', requestId },
        { status: 404 },
      );
    }

    // Validate reward is available
    const now = new Date();
    if (!discountReward.enabled) {
      return NextResponse.json(
        { ok: false, error: 'Discount reward is not available', requestId },
        { status: 400 },
      );
    }

    if (discountReward.startsAt && discountReward.startsAt > now) {
      return NextResponse.json(
        { ok: false, error: 'Discount reward is not yet available', requestId },
        { status: 400 },
      );
    }

    if (discountReward.endsAt && discountReward.endsAt < now) {
      return NextResponse.json(
        { ok: false, error: 'Discount reward has expired', requestId },
        { status: 400 },
      );
    }

    // Check achievement requirement
    if (discountReward.requiresAchievementId) {
      const hasAchievement = await db.userAchievement.findFirst({
        where: {
          userId: user.id,
          Achievement: {
            code: discountReward.requiresAchievementId,
          },
        },
      });

      if (!hasAchievement) {
        return NextResponse.json(
          { ok: false, error: 'Required achievement not unlocked', requestId },
          { status: 403 },
        );
      }
    }

    // Check max uses per user
    if (discountReward.maxUsesPerUser) {
      const userPurchases = await db.couponGrant.count({
        where: {
          userId: user.id,
          discountRewardId: discountReward.id,
        },
      });

      if (userPurchases >= discountReward.maxUsesPerUser) {
        return NextResponse.json(
          { ok: false, error: 'Maximum purchases per user reached', requestId },
          { status: 400 },
        );
      }
    }

    // Check max total uses
    if (discountReward.maxTotalUses) {
      const totalPurchases = await db.couponGrant.count({
        where: {
          discountRewardId: discountReward.id,
        },
      });

      if (totalPurchases >= discountReward.maxTotalUses) {
        return NextResponse.json(
          { ok: false, error: 'Maximum total purchases reached', requestId },
          { status: 400 },
        );
      }
    }

    // Spend petals
    const petalService = new PetalService();
    const spendResult = await petalService.spendPetals(
      userId,
      discountReward.petalCost,
      `Discount reward purchase: ${discountReward.name}`,
      requestId,
    );

    if (!spendResult.success) {
      logger.error('Discount reward purchase failed - insufficient petals', {
        requestId,
        userId,
        extra: {
          discountRewardId: discountReward.id,
          discountRewardName: discountReward.name,
          petalCost: discountReward.petalCost,
          error: spendResult.error,
        },
      });
      return NextResponse.json(
        { ok: false, error: spendResult.error || 'Insufficient petals', requestId },
        { status: 400 },
      );
    }

    // Create CouponGrant
    const code = `OM-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + discountReward.validityDays);

    const result = await db.$transaction(async (tx) => {
      // Store idempotency key
      await tx.idempotencyKey.create({
        data: {
          key: idempotencyKey,
          purpose: 'discount_reward_purchase',
        },
      });

      // Create CouponGrant
      const couponGrant = await tx.couponGrant.create({
        data: {
          userId: user.id,
          code,
          discountType: discountReward.discountType,
          amountOff: discountReward.amountOff,
          percentOff: discountReward.percentOff,
          expiresAt,
          petalCost: discountReward.petalCost,
          nsfwOnly: discountReward.nsfwOnly,
          requiresAchievementId: discountReward.requiresAchievementId,
          minSpendCents: discountReward.minSpendCents,
          discountRewardId: discountReward.id,
        },
      });

      return couponGrant;
    });

    // Log successful purchase
    logger.info('Discount reward purchased successfully', {
      requestId,
      userId,
      extra: {
        discountRewardId: discountReward.id,
        discountRewardName: discountReward.name,
        couponCode: result.code,
        discountType: result.discountType,
        amountOff: result.amountOff,
        percentOff: result.percentOff,
        petalCost: discountReward.petalCost,
        newBalance: spendResult.newBalance,
        expiresAt: result.expiresAt?.toISOString(),
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        code: result.code,
        discountType: result.discountType,
        amountOff: result.amountOff,
        percentOff: result.percentOff,
        expiresAt: result.expiresAt?.toISOString(),
        minSpendCents: result.minSpendCents,
        newBalance: spendResult.newBalance,
      },
      requestId,
    });
  } catch (error: any) {
    logger.error('Error purchasing discount reward', {
      requestId,
      extra: {
        error: error?.message || String(error),
      },
    }, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      { ok: false, error: 'Internal server error', requestId },
      { status: 500 },
    );
  }
}

