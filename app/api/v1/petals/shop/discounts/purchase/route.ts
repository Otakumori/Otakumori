import { auth } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/app/lib/db';
import { PetalService } from '@/app/lib/petals';
import { z } from 'zod';
import { generateRequestId } from '@/lib/requestId';
import { getPolicyFromRequest } from '@/app/lib/policy/fromRequest';

export const runtime = 'nodejs';

const PurchaseSchema = z.object({
  discountRewardId: z.string().min(1),
});

/**
 * POST - Purchase a discount reward using petals
 * Creates a CouponGrant record for the user
 */
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
    const validated = PurchaseSchema.parse(body);

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
    const reward = await db.discountReward.findUnique({
      where: { id: validated.discountRewardId },
    });

    if (!reward) {
      return NextResponse.json(
        { ok: false, error: 'Discount reward not found', requestId },
        { status: 404 },
      );
    }

    if (!reward.enabled) {
      return NextResponse.json(
        { ok: false, error: 'Discount reward is disabled', requestId },
        { status: 400 },
      );
    }

    // Check validity window
    const now = new Date();
    if (reward.startsAt && reward.startsAt > now) {
      return NextResponse.json(
        { ok: false, error: 'Discount reward not yet available', requestId },
        { status: 400 },
      );
    }
    if (reward.endsAt && reward.endsAt < now) {
      return NextResponse.json(
        { ok: false, error: 'Discount reward has expired', requestId },
        { status: 400 },
      );
    }

    // Check NSFW requirement
    const policy = getPolicyFromRequest(req);
    if (reward.nsfwOnly && !policy.nsfwAllowed) {
      return NextResponse.json(
        { ok: false, error: 'NSFW content not allowed', requestId },
        { status: 403 },
      );
    }

    // Check achievement requirement
    if (reward.requiresAchievementId) {
      const hasAchievement = await db.userAchievement.findFirst({
        where: {
          userId: user.id,
          achievementId: reward.requiresAchievementId,
        },
      });

      if (!hasAchievement) {
        return NextResponse.json(
          { ok: false, error: 'Achievement requirement not met', requestId },
          { status: 403 },
        );
      }
    }

    // Check usage limits
    if (reward.maxUsesPerUser) {
      const userPurchases = await db.couponGrant.count({
        where: {
          userId: user.id,
          discountRewardId: reward.id,
        },
      });
      if (userPurchases >= reward.maxUsesPerUser) {
        return NextResponse.json(
          { ok: false, error: 'Maximum purchases reached for this reward', requestId },
          { status: 400 },
        );
      }
    }

    if (reward.maxTotalUses) {
      const totalPurchases = await db.couponGrant.count({
        where: {
          discountRewardId: reward.id,
        },
      });
      if (totalPurchases >= reward.maxTotalUses) {
        return NextResponse.json(
          { ok: false, error: 'Discount reward is sold out', requestId },
          { status: 400 },
        );
      }
    }

    // Spend petals
    const petalService = new PetalService();
    const spendResult = await petalService.spendPetals(
      user.id,
      reward.petalCost,
      `Discount reward purchase: ${reward.name}`,
      requestId,
    );

    if (!spendResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: spendResult.error || 'Failed to spend petals',
          requestId,
        },
        { status: 400 },
      );
    }

    // Create CouponGrant
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + reward.validityDays);

    const code = `OM-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

    const couponGrant = await db.couponGrant.create({
      data: {
        userId: user.id,
        code,
        discountType: reward.discountType,
        amountOff: reward.amountOff,
        percentOff: reward.percentOff,
        expiresAt,
        petalCost: reward.petalCost,
        nsfwOnly: reward.nsfwOnly,
        requiresAchievementId: reward.requiresAchievementId,
        minSpendCents: reward.minSpendCents,
        discountRewardId: reward.id,
      },
    });

    // Log discount purchase
    const { logger } = await import('@/app/lib/logger');
    logger.info('Discount reward purchased', {
      requestId,
      userId: user.id,
      extra: {
        discountRewardId: reward.id,
        discountRewardName: reward.name,
        petalCost: reward.petalCost,
        couponGrantId: couponGrant.id,
        couponCode: couponGrant.code,
        discountType: couponGrant.discountType,
        amountOff: couponGrant.amountOff,
        percentOff: couponGrant.percentOff,
        newBalance: spendResult.newBalance,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        couponGrant: {
          id: couponGrant.id,
          code: couponGrant.code,
          discountType: couponGrant.discountType,
          amountOff: couponGrant.amountOff,
          percentOff: couponGrant.percentOff,
          expiresAt: couponGrant.expiresAt,
          minSpendCents: couponGrant.minSpendCents,
        },
        newBalance: spendResult.newBalance,
      },
      requestId,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Validation error',
          details: error.errors,
          requestId,
        },
        { status: 400 },
      );
    }
    console.error('Error purchasing discount reward:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error', requestId },
      { status: 500 },
    );
  }
}

