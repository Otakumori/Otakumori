/**
 * Purchase Discount Voucher with Petals
 *
 * Allows users to purchase discount vouchers (5%, 10%, 15% off) using petals.
 * Vouchers are stored as CouponGrant records and can be used at checkout.
 */

import { logger } from '@/app/lib/logger';
import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { PetalService } from '@/app/lib/petals';
import { generateRequestId } from '@/lib/requestId';
import { DISCOUNT_VOUCHER_TIERS } from '@/app/config/petalTuning';
import { env } from '@/env';

export const runtime = 'nodejs';

const PurchaseVoucherSchema = z.object({
  tier: z.enum(['tier1', 'tier2', 'tier3']),
});

// Check if discount vouchers are enabled
function isDiscountEnabled(): boolean {
  return env.PETAL_DISCOUNT_ENABLED === 'true';
}

// Get discount configuration with defaults
function getDiscountConfig() {
  return {
    minOrderCents: parseInt(env.PETAL_DISCOUNT_MIN_ORDER_CENTS || '2000', 10), // $20 default
    maxPercent: parseInt(env.PETAL_DISCOUNT_MAX_PERCENT || '15', 10), // 15% default
    maxPerUserMonth: parseInt(env.PETAL_DISCOUNT_MAX_PER_USER_MONTH || '3', 10), // 3 per month default
  };
}

export async function POST(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check if discount vouchers are enabled
    if (!isDiscountEnabled()) {
      return NextResponse.json(
        { ok: false, error: 'Discount vouchers are not currently available', requestId },
        { status: 503 },
      );
    }

    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request
    const body = await req.json();
    const validation = PurchaseVoucherSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { ok: false, error: 'VALIDATION_ERROR', details: validation.error.issues, requestId },
        { status: 400 },
      );
    }

    const { tier } = validation.data;
    const voucherConfig = DISCOUNT_VOUCHER_TIERS[tier];

    if (!voucherConfig) {
      return NextResponse.json(
        { ok: false, error: 'Invalid voucher tier', requestId },
        { status: 400 },
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found', requestId }, { status: 404 });
    }

    // Check monthly limit
    const config = getDiscountConfig();
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const vouchersThisMonth = await db.couponGrant.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: firstDayOfMonth,
        },
        redeemedAt: null, // Only count unused vouchers
      },
    });

    if (vouchersThisMonth >= config.maxPerUserMonth) {
      return NextResponse.json(
        {
          ok: false,
          error: `Monthly limit reached. You can purchase up to ${config.maxPerUserMonth} vouchers per month.`,
          requestId,
        },
        { status: 429 },
      );
    }

    // Check if user has enough petals
    const petalService = new PetalService();
    const wallet = await db.petalWallet.findUnique({
      where: { userId: user.id },
    });

    const currentBalance = wallet?.balance || 0;

    if (currentBalance < voucherConfig.costPetals) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Insufficient petals',
          requestId,
          data: {
            required: voucherConfig.costPetals,
            current: currentBalance,
          },
        },
        { status: 400 },
      );
    }

    // Validate discount percent doesn't exceed max
    if (voucherConfig.percent > config.maxPercent) {
      return NextResponse.json(
        {
          ok: false,
          error: `Discount percent exceeds maximum allowed (${config.maxPercent}%)`,
          requestId,
        },
        { status: 400 },
      );
    }

    // Spend petals first (PetalService handles its own transaction)
    const spendResult = await petalService.spendPetals(
      user.id,
      voucherConfig.costPetals,
      `Purchased discount voucher: ${voucherConfig.name}`,
      requestId,
    );

    if (!spendResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: spendResult.error || 'Failed to spend petals',
          requestId,
        },
        { status: 500 },
      );
    }

    // Generate unique voucher code
    const voucherCode = `PETAL_${tier.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create CouponGrant (voucher)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

    const couponGrant = await db.couponGrant.create({
      data: {
        userId: user.id,
        code: voucherCode,
        discountType: 'PERCENT',
        percentOff: voucherConfig.percent,
        expiresAt,
      },
    });

    const result = {
      voucherCode,
      couponGrant,
      newBalance: spendResult.newBalance,
      lifetimePetalsEarned: spendResult.lifetimePetalsEarned,
    };

    return NextResponse.json({
      ok: true,
      data: {
        voucherCode: result.voucherCode,
        percentOff: voucherConfig.percent,
        expiresAt: result.couponGrant.expiresAt,
        balance: result.newBalance,
        lifetimePetalsEarned: result.lifetimePetalsEarned,
      },
      requestId,
    });
  } catch (error: any) {
    logger.error('[Voucher Purchase] Error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error.message, requestId },
      { status: 500 },
    );
  }
}
