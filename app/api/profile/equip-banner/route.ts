import { logger } from '@/app/lib/logger';
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
  try {
    const { localUserId } = await requireLocalViewer();
    const { bannerKey } = await req.json();
    if (!bannerKey) return new NextResponse('Missing bannerKey', { status: 400 });

    // verify ownership (replace with your real checks)
    const owns = await db.inventoryItem.findFirst({
      where: { userId: localUserId, sku: bannerKey },
    });
    if (!owns) return new NextResponse('Forbidden', { status: 403 });

    await db.userProfile.upsert({
      where: { userId: localUserId },
      update: { bannerKey },
      create: { userId: localUserId, bannerKey },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    if (error instanceof LocalUserUnavailableError) {
      return schemaUnavailableResponse('profile_user_unavailable');
    }

    logger.error(
      'Error equipping banner:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ error: 'Failed to equip banner' }, { status: 500 });
  }
}
