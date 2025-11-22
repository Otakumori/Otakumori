/**
 * List User's Discount Vouchers
 *
 * Returns all active (unused, non-expired) discount vouchers for the authenticated user.
 */

import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateRequestId } from '@/lib/requestId';
import { env } from '@/env';

export const runtime = 'nodejs';

function isDiscountEnabled(): boolean {
  return env.PETAL_DISCOUNT_ENABLED === 'true';
}

export async function GET(_req: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check if discount vouchers are enabled
    if (!isDiscountEnabled()) {
      return NextResponse.json(
        { ok: true, data: { vouchers: [] }, requestId }, // Return empty array if disabled
      );
    }

    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found', requestId }, { status: 404 });
    }

    // Get active vouchers (unused, not expired)
    const now = new Date();
    const vouchers = await db.couponGrant.findMany({
      where: {
        userId: user.id,
        redeemedAt: null, // Not yet redeemed
        OR: [
          { expiresAt: null }, // No expiry
          { expiresAt: { gt: now } }, // Not expired
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        vouchers: vouchers.map((v) => ({
          code: v.code,
          percentOff: v.percentOff,
          amountOff: v.amountOff,
          discountType: v.discountType,
          expiresAt: v.expiresAt,
          createdAt: v.createdAt,
          minSpendCents: v.minSpendCents,
          nsfwOnly: v.nsfwOnly,
        })),
      },
      requestId,
    });
  } catch (error: any) {
    console.error('[Voucher List] Error:', error);

    return NextResponse.json(
      { ok: false, error: 'INTERNAL_ERROR', message: error.message, requestId },
      { status: 500 },
    );
  }
}
