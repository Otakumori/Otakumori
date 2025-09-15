export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    if (!body?.questId)
      return NextResponse.json(
        { ok: false, code: 'INVALID_INPUT', message: 'questId required' },
        { status: 400 },
      );
    // Persist unlock in UserSettings.notificationPreferences.card.emotes
    try {
      const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
      if (user) {
        const us = await db.userSettings.findUnique({ where: { userId: user.id } });
        const prefs = (us?.notificationPreferences as any) ?? {};
        const card = prefs.card ?? {};
        const emotes: string[] = Array.isArray(card.emotes) ? card.emotes : [];
        if (!emotes.includes('blush_burst')) emotes.push('blush_burst');
        card.emotes = emotes;
        const next = { ...prefs, card };
        await db.userSettings.upsert({
          where: { userId: user.id },
          update: { notificationPreferences: next },
          create: { userId: user.id, notificationPreferences: next },
        });
      }
    } catch {}
    // Return payload
    return NextResponse.json({
      ok: true,
      data: {
        unlocks: [{ type: 'emote', emoteId: 'blush_burst', source: 'game' }],
        loreFragments: ['bios_v1_3_slot_hint'],
        affinity: [{ npcId: 'maiden', delta: 2, score: 3 }],
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, code: 'SERVER_ERROR', message: 'Internal error' },
      { status: 500 },
    );
  }
}
