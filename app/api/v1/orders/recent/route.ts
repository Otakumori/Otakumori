import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required',
          },
        },
        {
          status: 401,
          headers: {
            'x-otm-reason': 'AUTH_REQUIRED',
          },
        },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '8'), 20); // Max 20 orders

    // Fetch recent completed orders for the user
    const orders = await db.order.findMany({
      where: {
        userId,
        status: {
          in: ['shipped', 'in_production', 'pending'], // Only show meaningful statuses
        },
      },
      select: {
        id: true,
        displayNumber: true,
        primaryItemName: true,
        label: true,
        totalAmount: true,
        currency: true,
        status: true,
        createdAt: true,
        paidAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      data: orders.map((order) => ({
        ...order,
        createdAt: order.createdAt.toISOString(),
        paidAt: order.paidAt?.toISOString() || null,
      })),
    });
  } catch (error) {
    logger.error('Failed to fetch recent orders:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch orders',
        },
      },
      { status: 500 },
    );
  }
}
