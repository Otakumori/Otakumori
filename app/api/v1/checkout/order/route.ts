import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

/**
 * POST /api/v1/checkout/order
 * Fulfillment is intentionally not client-triggerable.
 * Stripe webhook truth owns paid order fulfillment.
 * Requires authentication
 */
export async function POST(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Fulfillment is started after verified payment webhook processing.',
        nextAction: 'Complete Stripe Checkout and wait for the canonical Stripe webhook to reconcile the order.',
      },
      { status: 409 },
    );
  } catch (error) {
    logger.error('[Printify] Checkout fulfillment gate failed:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      { ok: false, error: 'Unable to check fulfillment gate' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/checkout/order?orderId=xxx
 * Get sync status for an order
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ ok: false, error: 'Order ID required' }, { status: 400 });
    }

    const syncRecord = await db.printifyOrderSync.findUnique({
      where: { localOrderId: orderId },
    });

    if (!syncRecord) {
      return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      data: syncRecord,
    });
  } catch (error) {
    logger.error('[Printify] Failed to get order sync status:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json(
      {
        ok: false,
        error: 'Unable to load order fulfillment status',
      },
      { status: 500 },
    );
  }
}
