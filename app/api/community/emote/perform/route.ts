export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

const windowMs = 30_000;
const limit = 8;
const bins: Record<string, number[]> = {};

export async function POST(req: Request) {
  const now = Date.now();
  const authResult = await auth();
  const userId = authResult?.userId;
  if (!userId) return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED' }, { status: 401 });
  const key: string = userId;
  const arr = bins[key] ?? (bins[key] = []);
  while (arr.length > 0) {
    const oldest = arr[0]!;
    if (now - oldest <= windowMs) {
      break;
    }
    arr.shift();
  }
  if (arr.length >= limit) {
    const res = NextResponse.json(
      { ok: false, code: 'RATE_LIMIT', message: 'Too many emotes' },
      { status: 429 },
    );
    res.headers.set('Retry-After', '10');
    return res;
  }
  arr.push(now);

  // Optional combo tracking
  try {
    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
    if (user) {
      const body = await req.json().catch(() => ({}));
      const emoteId: string | undefined = body?.emoteId;
      const us = await db.userSettings.findUnique({ where: { userId: user.id } });
      const prefs = (us?.notificationPreferences as any) ?? {};
      const card = prefs.card ?? {};
      const nowTs = Date.now();
      const last: Record<string, number> = card.emoteLast || {};
      if (emoteId) last[emoteId] = nowTs;
      // simple combo: bow then thrust within 2500ms
      const combos: string[] = Array.isArray(card.combos) ? card.combos : [];
      if (last['bow'] && last['thrust'] && Math.abs(last['thrust'] - last['bow']) <= 2500) {
        if (!combos.includes('bow_thrust')) combos.push('bow_thrust');
      }
      card.emoteLast = last;
      card.combos = combos;
      const next = { ...prefs, card };
      await db.userSettings.upsert({
        where: { userId: user.id },
        update: { notificationPreferences: next },
        create: { userId: user.id, notificationPreferences: next },
      });
    }
  } catch {}

  return NextResponse.json({ ok: true });
}
