
import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: true }); // guest: ignore
    }

    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        nsfwAffirmedAt: new Date(),
        nsfwAffirmationVer: { increment: 1 },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error(
      'NSFW affirmation error:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );
    return NextResponse.json({ ok: false, error: 'AFFIRMATION_ERROR' }, { status: 500 });
  }
}
