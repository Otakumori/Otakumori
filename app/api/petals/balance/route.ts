export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { petalBalance: true },
    });
    const balance = user?.petalBalance ?? 0;
    return NextResponse.json({ ok: true, balance });
  } catch (err) {
    logger.error(
      'petals/balance error',
      undefined,
      undefined,
      err instanceof Error ? err : new Error(String(err)),
    );
    return NextResponse.json({ ok: false, code: 'SERVER_ERROR' }, { status: 500 });
  }
}
