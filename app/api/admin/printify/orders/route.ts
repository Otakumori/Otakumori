import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { getPrintifyService } from '@/app/lib/printify/service';
import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';

export const runtime = 'nodejs';

// GET /api/admin/printify/orders - List orders
export const GET = withAdminAuth(async (req: NextRequest) => {
  const requestId = newRequestId();
  const searchParams = req.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    const service = getPrintifyService();
    const result = await service.getOrders(page, limit);

    return NextResponse.json({
      ok: true,
      data: result,
      requestId,
    });
  } catch (error) {
    logger.error('admin_printify_orders_list_failed', { requestId }, { error: String(error) });
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch orders',
        requestId,
      },
      { status: 500 },
    );
  }
});

