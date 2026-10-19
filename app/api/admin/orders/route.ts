import { type NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/app/lib/auth/admin';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/app/lib/request-id';
import { createApiError } from '@/app/lib/api-contracts';
import { reconcileOrderFinancials } from '@/lib/finance/reporting';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const requestId = generateRequestId();

  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);

    const status = searchParams.get('status');
    const dateRange = searchParams.get('dateRange') || '30days';
    const search = searchParams.get('search');
    const attention = searchParams.get('attention');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const where: any = {};

    // Filter by status
    if (status && status !== 'all') {
      where.status = status;
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const days = parseInt(dateRange.replace('days', ''), 10);
      if (!isNaN(days)) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        where.createdAt = { gte: startDate };
      }
    }

    // Search across multiple fields
    if (search) {
      const searchNum = parseInt(search, 10);
      where.OR = [
        ...(isNaN(searchNum) ? [] : [{ displayNumber: searchNum }]),
        { User: { email: { contains: search, mode: 'insensitive' } } },
        { primaryItemName: { contains: search, mode: 'insensitive' } },
        { stripeId: { contains: search, mode: 'insensitive' } },
        { trackingNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (attention === 'pending-payment') {
      where.status = 'pending';
      where.paidAt = null;
    } else if (attention === 'pending-fulfillment') {
      where.paidAt = { not: null };
      where.status = { in: ['pending', 'pending_mapping', 'in_production'] };
      where.OR = [
        { PrintifyOrderSync: null },
        {
          PrintifyOrderSync: {
            status: { in: ['pending', 'submitting', 'accepted', 'in_production'] },
          },
        },
      ];
    } else if (attention === 'fulfillment-error') {
      where.PrintifyOrderSync = { status: { in: ['failed', 'mapping_failed', 'no_items'] } };
    } else if (attention === 'submission-uncertain') {
      where.PrintifyOrderSync = { status: 'submission_uncertain' };
    } else if (attention === 'cancelled-refunded') {
      where.OR = [{ status: 'cancelled' }, { refundAmount: { gt: 0 } }];
    }

    const orders = await db.order.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
        OrderItem: {
          select: {
            id: true,
            name: true,
            quantity: true,
            unitAmount: true,
            sku: true,
          },
        },
        PrintifyOrderSync: true,
        FinancialTransaction: {
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      data: orders.map((order) => ({
        ...order,
        reconciliation: reconcileOrderFinancials(order, order.FinancialTransaction),
      })),
      requestId,
    });
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('Admin access')) {
      return NextResponse.json(createApiError('FORBIDDEN', error.message, requestId), {
        status: 403,
      });
    }

    return NextResponse.json(
      createApiError('INTERNAL_ERROR', 'Failed to fetch orders', requestId),
      { status: 500 },
    );
  }
}
