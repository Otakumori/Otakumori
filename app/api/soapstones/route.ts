
import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export async function GET() {
  try {
    const db = await getDb();
    const items = await db.soapstoneMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ items });
  } catch (e) {
    logger.error(
      'soapstones:get',
      undefined,
      undefined,
      e instanceof Error ? e : new Error(String(e)),
    );
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
