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
    const owns = await db.userInventory.findFirst({
      where: { userId, itemKey: bannerKey },
    });
    if (!owns) return new NextResponse('Forbidden', { status: 403 });

    await db.userProfile.upsert({
      where: { userId },
      update: { bannerKey },
      create: { userId, bannerKey },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error equipping banner:', error);
    return NextResponse.json({ error: 'Failed to equip banner' }, { status: 500 });
  }
}
