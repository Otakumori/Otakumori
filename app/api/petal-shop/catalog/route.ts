import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
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
    return NextResponse.json({ ok: true, data: { items } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'catalog_failed' }, { status: 500 });
  }
}

