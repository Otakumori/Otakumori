import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { logger } from '@/app/lib/logger';
import { reqId } from '@/lib/log';
import { problem } from '@/lib/http/problem';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const rid = reqId(req.headers);
  logger.request(req, 'GET /api/petal-shop/catalog');
  try {
    const now = new Date();
    const items = await prisma.petalShopItem.findMany({
      where: {
        OR: [
          { visibleFrom: null, visibleTo: null },
          { visibleFrom: null, visibleTo: { gte: now } },
          { visibleFrom: { lte: now }, visibleTo: null },
          { visibleFrom: { lte: now }, visibleTo: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ ok: true, data: { items }, requestId: rid });
  } catch (e: any) {
    logger.error(
      'petal_shop_catalog_error',
      { requestId: rid },
      { error: String(e?.message || e) },
    );
    return NextResponse.json(problem(500, 'catalog_failed', e?.message), { status: 500 });
  }
}
