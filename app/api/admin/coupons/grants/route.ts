import { NextResponse, type NextRequest } from 'next/server';

async function getPrisma() {
  const { prisma } = await import('@/app/lib/prisma');
  return prisma;
}

async function getRequireAdmin() {
  const { requireAdmin } = await import('@/app/lib/authz');
  return requireAdmin;
}

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

async function getProblem() {
  const { problem } = await import('@/lib/http/problem');
  return problem;
}

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const requireAdmin = await getRequireAdmin();
  const logger = await getLogger();

  await requireAdmin();
  logger.request(req, 'GET /api/admin/coupons/grants');
  try {
    const { searchParams } = new URL(req.url);
    const take = Math.min(100, Math.max(1, parseInt(searchParams.get('take') || '50', 10)));
    const skip = Math.max(0, parseInt(searchParams.get('skip') || '0', 10));
    const userId = searchParams.get('userId') || undefined;

    const where = userId ? { userId } : {};
    const prisma = await getPrisma();
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
    const logger = await getLogger();
    logger.error(
      'admin_coupon_grants_error',
      { route: '/api/admin/coupons/grants' },
      { error: String(e?.message || e) },
    );
    const problem = await getProblem();
    return NextResponse.json(problem(500, 'fetch_failed', e?.message), { status: 500 });
  }
}
