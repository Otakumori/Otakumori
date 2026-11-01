import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { PetalSpendError, spendPetalsAndFulfill } from '@/app/lib/petals/spend';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';

const PurchaseVoucherRequestSchema = z.object({
  discountRewardId: z.string().min(1),
  idempotencyKey: z.string().min(1),
});

/**
 * POST /api/v1/vouchers/from-petals
 *
 * Purchase a discount voucher using petals.
 * Creates a CouponGrant record linked to a DiscountReward template.
 */
export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Require authentication
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { ok: false, error: 'AUTH_REQUIRED', requestId },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    // Parse and validate request
    const body = await req.json();
    const validation = PurchaseVoucherRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          ok: false,
          error: 'VALIDATION_ERROR',
          details: validation.error.errors,
          requestId,
        },
        { status: 400 },
      );
    }

    const { discountRewardId, idempotencyKey } = validation.data;

    // Check idempotency using IdempotencyKey table
    const existingKey = await db.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existingKey) {
      return NextResponse.json(
        { ok: false, error: 'DUPLICATE_REQUEST', requestId },
        { status: 409 },
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'USER_NOT_FOUND', requestId }, { status: 404 });
    }

    // Get discount reward
    const discountReward = await db.discountReward.findUnique({
      where: { id: discountRewardId },
    });

    if (!discountReward) {
      return NextResponse.json(
        { ok: false, error: 'DISCOUNT_REWARD_NOT_FOUND', requestId },
        { status: 404 },
      );
    }

    // Validate reward is enabled and available
    if (!discountReward.enabled) {
      return NextResponse.json(
        { ok: false, error: 'DISCOUNT_REWARD_DISABLED', requestId },
        { status: 403 },
      );
    }

    const now = new Date();
    if (discountReward.startsAt && discountReward.startsAt > now) {
      return NextResponse.json(
        { ok: false, error: 'DISCOUNT_REWARD_NOT_AVAILABLE_YET', requestId },
        { status: 403 },
      );
    }

    if (discountReward.endsAt && discountReward.endsAt < now) {
      return NextResponse.json(
        { ok: false, error: 'DISCOUNT_REWARD_EXPIRED', requestId },
        { status: 403 },
      );
    }

    // Check usage limits
    if (discountReward.maxUsesPerUser) {
      const userPurchases = await db.couponGrant.count({
        where: {
          userId: user.id,
          discountRewardId: discountReward.id,
        },
      });
      if (userPurchases >= discountReward.maxUsesPerUser) {
        return NextResponse.json(
          { ok: false, error: 'MAX_USES_PER_USER_REACHED', requestId },
          { status: 403 },
        );
      }
    }

    if (discountReward.maxTotalUses) {
      const totalPurchases = await db.couponGrant.count({
        where: {
          discountRewardId: discountReward.id,
        },
      });
      if (totalPurchases >= discountReward.maxTotalUses) {
        return NextResponse.json(
          { ok: false, error: 'MAX_TOTAL_USES_REACHED', requestId },
          { status: 403 },
        );
      }
    }

    // Check achievement requirement if present
    if (discountReward.requiresAchievementId) {
      const hasAchievement = await db.userAchievement.findFirst({
        where: {
          userId: user.id,
          achievementId: discountReward.requiresAchievementId,
        },
      });
      if (!hasAchievement) {
        return NextResponse.json(
          { ok: false, error: 'ACHIEVEMENT_REQUIRED', requestId },
          { status: 403 },
        );
      }
    }

    // Check user has enough petals
    const wallet = await db.petalWallet.findUnique({
      where: { userId: user.id },
      select: { balance: true },
    });

    const currentBalance = wallet?.balance || 0;
    if (currentBalance < discountReward.petalCost) {
      return NextResponse.json(
        {
          ok: false,
          error: 'INSUFFICIENT_PETALS',
          requestId,
          data: {
            required: discountReward.petalCost,
            current: currentBalance,
          },
        },
        { status: 400 },
      );
    }

    // Generate unique voucher code
    const voucherCode = `OM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // Calculate expiry date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + discountReward.validityDays);

    // Create CouponGrant record
    const purchase = await spendPetalsAndFulfill(
      user.id,
      discountReward.petalCost,
      `Purchased discount voucher: ${discountReward.name}`,
      'voucher_purchase',
      async (tx) => {
        await tx.idempotencyKey.create({
          data: { key: idempotencyKey, purpose: 'voucher_purchase' },
        });
        return tx.couponGrant.create({
          data: {
            userId: user.id,
            code: voucherCode,
            discountType: discountReward.discountType,
            percentOff: discountReward.percentOff,
            amountOff: discountReward.amountOff,
            expiresAt,
            petalCost: discountReward.petalCost,
            nsfwOnly: discountReward.nsfwOnly,
            requiresAchievementId: discountReward.requiresAchievementId,
            minSpendCents: discountReward.minSpendCents,
            discountRewardId: discountReward.id,
          },
        });
      },
    );
    const couponGrant = purchase.fulfillment;

    const response = {
      ok: true,
      data: {
        voucherCode: couponGrant.code,
        discountType: couponGrant.discountType,
        percentOff: couponGrant.percentOff,
        amountOff: couponGrant.amountOff,
        expiresAt: couponGrant.expiresAt,
        minSpendCents: couponGrant.minSpendCents,
        balance: purchase.newBalance,
        lifetimePetalsEarned: purchase.lifetimePetalsEarned,
      },
      requestId,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof PetalSpendError && error.code === 'INSUFFICIENT_PETALS') {
      return NextResponse.json(
        { ok: false, error: 'INSUFFICIENT_PETALS', requestId },
        { status: 400 },
      );
    }
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { ok: false, error: 'DUPLICATE_REQUEST', requestId },
        { status: 409 },
      );
    }
    logger.error(
      '[Voucher Purchase] Error:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json(
      {
        ok: false,
        error: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
      },
      { status: 500 },
    );
  }
}
