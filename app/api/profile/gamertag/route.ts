import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  requireLocalViewer,
  schemaUnavailableResponse,
} from '@/app/lib/auth/viewer';

const db = new PrismaClient();

export async function POST(req: Request) {
  let localUserId: string;
  try {
    ({ localUserId } = await requireLocalViewer());
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError) {
      return schemaUnavailableResponse('profile_user_unavailable');
    }
    throw error;
  }

  const { gamertag } = await req.json();
  if (typeof gamertag !== 'string' || gamertag.length < 3 || gamertag.length > 24) {
    return new NextResponse('Invalid gamertag', { status: 400 });
  }

  // You can add disallowed character checks here; no emojis requested
  if (/[\p{Extended_Pictographic}]/u.test(gamertag)) {
    return new NextResponse('Invalid characters', { status: 400 });
  }

  const profile = await db.userProfile.findUnique({ where: { userId: localUserId } });
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
    where: { userId: localUserId },
    update: { gamertag, gamertagChangedAt: now },
    create: { userId: localUserId, gamertag, gamertagChangedAt: now },
  });

  return NextResponse.json({ ok: true });
}
