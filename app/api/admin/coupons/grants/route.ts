import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { requireAdmin } from '@/app/lib/authz';
import { logger } from '@/app/lib/logger';
import { problem } from '@/lib/http/problem';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  await requireAdmin();
  logger.request(req, 'GET /api/admin/coupons/grants');
  try {
    const { searchParams } = new URL(req.url);
    const take = Math.min(100, Math.max(1, parseInt(searchParams.get('take') || '50', 10)));
    const skip = Math.max(0, parseInt(searchParams.get('skip') || '0', 10));
    const userId = searchParams.get('userId') || undefined;

    const where = userId ? { userId } : {};
    const [total, rows] = await Promise.all([
      prisma.couponGrant.count({ where }),
      prisma.couponGrant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: { user: { select: { id: true, username: true } } },
      }),
    ]);

    return NextResponse.json({ ok: true, data: { total, rows } });
  } catch (e: any) {
    logger.error(
      'admin_coupon_grants_error',
      { route: '/api/admin/coupons/grants' },
      { error: String(e?.message || e) },
    );
    return NextResponse.json(problem(500, 'fetch_failed', e?.message), { status: 500 });
  }
}
