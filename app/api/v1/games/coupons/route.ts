/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
export const dynamic = "force-dynamic";      // tells Next this cannot be statically analyzed
export const runtime = "nodejs";              // keep on Node runtime (not edge)
export const preferredRegion = "iad1";        // optional: co-locate w/ your logs region
export const maxDuration = 10;                // optional guard

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { GetCouponsResponseSchema } from '@/app/lib/contracts';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's active coupons (not expired, not redeemed)
    const now = new Date();
    const coupons = await db.couponGrant.findMany({
      where: {
        userId: user.id,
        redeemedAt: null,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform to match contract schema
    const transformedCoupons = coupons.map(coupon => ({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      amountOff: coupon.amountOff,
      percentOff: coupon.percentOff,
      expiresAt: coupon.expiresAt?.toISOString(),
      createdAt: coupon.createdAt.toISOString(),
      redeemedAt: coupon.redeemedAt?.toISOString()
    }));

    return NextResponse.json({
      ok: true,
      data: {
        coupons: transformedCoupons,
        total: transformedCoupons.length
      }
    });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
