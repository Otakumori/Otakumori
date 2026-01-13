import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { getPrintifyService } from '@/app/lib/printify/service';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs';

// POST /api/admin/printify/orders/[orderId]/cancel - Cancel order
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  return withAdminAuth(async (request: NextRequest) => {
    const requestId = newRequestId();
    const { orderId } = await params;

    try {
      const service = getPrintifyService();
      const result = await service.cancelOrder(orderId);

      logger.info('admin_printify_order_cancelled', { requestId }, { orderId });

      return NextResponse.json({
        ok: true,
        data: result,
        requestId,
      });
    } catch (error) {
      logger.error('admin_printify_order_cancellation_failed', { requestId }, {
        orderId,
        error: String(error),
      });
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to cancel order',
          requestId,
        },
        { status: 500 },
      );
    }
  })(req);
}

