export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED' }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, code: 'NOT_FOUND' }, { status: 404 });
    const us = await db.userSettings.findUnique({ where: { userId: user.id } });
    const prefs = (us?.notificationPreferences as any) ?? {};
    const card = prefs.card ?? {};
    const emotes: string[] = Array.isArray(card.emotes) ? card.emotes : [];
    return NextResponse.json({ ok: true, data: { items: emotes } });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('Failed to fetch user emotes:', error.message, error.stack);
    return NextResponse.json(
      { ok: false, code: 'SERVER_ERROR', message: 'Internal error' },
      { status: 500 },
    );
  }
}
