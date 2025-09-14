export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

type Item = {
  id: string;
  canonicalId: string;
  displayName?: string | null;
  glyph?: string | null;
  lore?: string | null;
  quantity: number;
};

export async function GET(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED', message: 'Sign in required' }, { status: 401 });
    }

    // Fetch user's runes and aggregate by canonicalId
    const owned = await db.userRune.findMany({
      where: { userId },
      include: { rune: true },
    });

    const map = new Map<string, Item>();
    for (const ur of owned) {
      const key = ur.rune.canonicalId;
      const prev = map.get(key);
      if (prev) {
        prev.quantity += 1;
      } else {
        map.set(key, {
          id: ur.rune.id,
          canonicalId: ur.rune.canonicalId,
          displayName: ur.rune.displayName,
          glyph: ur.rune.glyph,
          lore: ur.rune.lore,
          quantity: 1,
        });
      }
    }

    const items = Array.from(map.values());
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error('trade/inventory error', err);
    return NextResponse.json({ ok: false, code: 'SERVER_ERROR', message: 'Internal error' }, { status: 500 });
  }
}

