export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { logger } from '@/app/lib/logger';
import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { ok: false, code: 'UNAUTHENTICATED', message: 'Sign in required' },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const runeIds: string[] = Array.isArray(body?.runeIds) ? body.runeIds : [];
    if (!runeIds || runeIds.length < 2) {
      return NextResponse.json(
        { ok: false, code: 'INVALID_INPUT', message: 'Select two or more runes' },
        { status: 400 },
      );
    }

    // Validate ownership of each rune id (by canonical or record id?)
    // We accept canonical IDs; check user has at least as many as requested per canonical id
    const counts = new Map<string, number>();
    for (const id of runeIds) counts.set(id, (counts.get(id) ?? 0) + 1);

    const owned = await db.userRune.findMany({
      where: { userId },
      include: { RuneDef: true },
    });

    for (const [canon, need] of counts.entries()) {
      const have = owned.filter((ur) => ur.RuneDef.canonicalId === canon).length;
      if (have < need) {
        return NextResponse.json(
          { ok: false, code: 'INSUFFICIENT', message: `You do not own enough of ${canon}` },
          { status: 400 },
        );
      }
    }

    // Fusion disabled in MVP — respond with friendly stub
    return NextResponse.json(
      { ok: false, code: 'DISABLED', message: 'Fusion is not enabled yet. Coming soon.' },
      { status: 200 },
    );
  } catch (err) {
    logger.error(
      'trade/fuse error',
      undefined,
      undefined,
      err instanceof Error ? err : new Error(String(err)),
    );
    return NextResponse.json(
      { ok: false, code: 'SERVER_ERROR', message: 'Internal error' },
      { status: 500 },
    );
  }
}
