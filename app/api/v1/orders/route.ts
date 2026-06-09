import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/orders
 * Direct provider fulfillment is disabled for public clients.
 * Stripe webhook truth owns payment reconciliation and fulfillment.
 */
export async function POST(_request: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Direct order submission is disabled.',
        nextAction: 'Create a Stripe Checkout Session and let the verified Stripe webhook reconcile paid fulfillment.',
        requestId: `otm_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      },
      { status: 409 },
    );
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error('Order creation error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      {
        ok: false,
        error: 'Unable to check order submission gate',
        requestId: `otm_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/orders
 * Get user's order history
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required' },
        { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const status = searchParams.get('status'); // Filter by order status

    // Log order query params
    const { logger } = await import('@/app/lib/logger');
    logger.warn('Orders requested with filters:', undefined, { limit, offset, status: status || 'all' });

    // TODO: Implement order history retrieval
    // const orders = await prisma.order.findMany({
    //   where: {
    //     userId,
    //     ...(status && { status }),
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   take: limit,
    //   skip: offset,
    //   include: {
    //     lineItems: true,
    //   },
    // });

    const mockOrders: Array<{
      id: string;
      status: string;
      createdAt: string;
      totalAmount: number;
    }> = []; // Placeholder until database is set up

    return NextResponse.json({
      ok: true,
      data: {
        orders: mockOrders,
        pagination: {
          limit,
          offset,
          total: 0,
        },
      },
      requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (error) {
    const { logger } = await import('@/app/lib/logger');
    logger.error('Order history error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Failed to get order history',
        requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      { status: 500 },
    );
  }
}

