import { type NextRequest, NextResponse } from 'next/server';
import { GET as getCanonicalOrders } from '@/app/api/orders/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Legacy order creation is permanently fail-closed. Paid fulfillment is owned
 * by /api/v1/checkout/session -> /api/webhooks/stripe.
 */
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    {
      ok: false,
      error: 'Legacy order creation is disabled. Start checkout through the canonical checkout route.',
      canonicalPath: '/api/v1/checkout/session',
    },
    { status: 410 },
  );
}

/**
 * GET /api/v1/orders
 * Get user's order history
 */
export async function GET(request: NextRequest) {
  return getCanonicalOrders(request);
}
