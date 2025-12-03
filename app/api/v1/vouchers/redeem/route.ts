import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/lib/requestId';

export const runtime = 'nodejs';

const RedeemVoucherRequestSchema = z.object({
  voucherCode: z.string().min(1),
  orderId: z.string().min(1),
});

/**
 * POST /api/v1/vouchers/redeem
 *
 * Mark a voucher as redeemed when used in an order.
 * Called from checkout webhook after successful payment.
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
    const validation = RedeemVoucherRequestSchema.safeParse(body);

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

    const { voucherCode, orderId } = validation.data;

    // Get user
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'USER_NOT_FOUND', requestId }, { status: 404 });
    }

    // Find voucher
    const voucher = await db.couponGrant.findUnique({
      where: { code: voucherCode },
    });

    if (!voucher) {
      return NextResponse.json(
        { ok: false, error: 'VOUCHER_NOT_FOUND', requestId },
        { status: 404 },
      );
    }

    // Validate voucher belongs to user
    if (voucher.userId !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'VOUCHER_NOT_OWNED', requestId },
        { status: 403 },
      );
    }

    // Validate voucher is not already redeemed
    if (voucher.redeemedAt) {
      return NextResponse.json(
        { ok: false, error: 'VOUCHER_ALREADY_REDEEMED', requestId },
        { status: 400 },
      );
    }

    // Validate voucher is not expired
    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      return NextResponse.json({ ok: false, error: 'VOUCHER_EXPIRED', requestId }, { status: 400 });
    }

    // Mark voucher as redeemed
    await db.couponGrant.update({
      where: { id: voucher.id },
      data: {
        redeemedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        voucherCode: voucher.code,
        redeemedAt: new Date().toISOString(),
        orderId,
      },
      requestId,
    });
  } catch (error) {
    logger.error('[Voucher Redeem] Error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
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
