import { logger } from '@/app/lib/logger';
import { auth } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/app/lib/db';
import { getPolicyFromRequest } from '@/app/lib/policy/fromRequest';

export const runtime = 'nodejs';

/**
 * GET - Fetch user's available discount vouchers (CouponGrant records)
 * Returns unredeemed, non-expired vouchers that can be used at checkout
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get NSFW policy
    const policy = getPolicyFromRequest(req);

    const now = new Date();

    // Get user's available CouponGrant vouchers
    const grants = await db.couponGrant.findMany({
      where: {
        userId: user.id,
        redeemedAt: null, // Not yet redeemed
        OR: [
          { expiresAt: null }, // No expiry
          { expiresAt: { gt: now } }, // Not expired
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Filter NSFW discounts if NSFW not allowed
    const availableDiscounts = grants
      .filter((grant) => {
        if (grant.nsfwOnly && !policy.nsfwAllowed) {
          return false;
        }
        return true;
      })
      .map((grant) => ({
        id: grant.id,
        code: grant.code,
        discountType: grant.discountType,
        amountOff: grant.amountOff,
        percentOff: grant.percentOff,
        expiresAt: grant.expiresAt?.toISOString() || null,
        minSpendCents: grant.minSpendCents,
        nsfwOnly: grant.nsfwOnly,
      }));

    return NextResponse.json({
      ok: true,
      data: { discounts: availableDiscounts },
    });
  } catch (error) {
    logger.error('Error fetching available discounts:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
