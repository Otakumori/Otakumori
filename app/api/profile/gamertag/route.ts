import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireUserId } from '@/app/lib/auth';

const db = new PrismaClient();

export async function POST(req: Request) {
  const userId = await requireUserId();
  const { gamertag } = await req.json();
  if (typeof gamertag !== 'string' || gamertag.length < 3 || gamertag.length > 24) {
    return new NextResponse('Invalid gamertag', { status: 400 });
  }

  // You can add disallowed character checks here; no emojis requested
  if (/[\p{Extended_Pictographic}]/u.test(gamertag)) {
    return new NextResponse('Invalid characters', { status: 400 });
  }

  const profile = await db.userProfile.findUnique({ where: { userId } });
  const now = new Date();
  if (profile?.gamertagChangedAt) {
    const diff = now.getTime() - profile.gamertagChangedAt.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 365) {
      return NextResponse.json(
        { ok: false, error: 'Gamertag can only be changed once per year.' },
        { status: 403 },
      );
    }
  }

  await db.userProfile.upsert({
    where: { userId },
    update: { gamertag, gamertagChangedAt: now },
    create: { userId, gamertag, gamertagChangedAt: now },
  });

  return NextResponse.json({ ok: true });
}
