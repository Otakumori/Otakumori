import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireUserId } from '@/app/lib/auth';

const db = new PrismaClient();

export async function POST(req: Request) {
  const userId = await requireUserId();

  try {
    const { bannerKey } = await req.json();
    if (!bannerKey) return new NextResponse('Missing bannerKey', { status: 400 });

    // verify ownership (replace with your real checks)
    const owns = await db.inventoryItem.findFirst({
      where: { userId, sku: bannerKey },
    });
    if (!owns) return new NextResponse('Forbidden', { status: 403 });

    await db.userProfile.upsert({
      where: { userId },
      update: { bannerKey },
      create: { userId, bannerKey },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error(
      'Error equipping banner:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ error: 'Failed to equip banner' }, { status: 500 });
  }
}
