export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED' }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, code: 'NOT_FOUND' }, { status: 404 });
    const us = await db.userSettings.findUnique({ where: { userId: user.id } });
    const prefs = (us?.notificationPreferences as any) ?? {};
    const card = prefs.card ?? {};
    const training: string[] = Array.isArray(card.training) ? card.training : [];
    if (!training.includes('persistent_bow')) training.push('persistent_bow');
    card.training = training;
    const next = { ...prefs, card };
    await db.userSettings.upsert({
      where: { userId: user.id },
      update: { notificationPreferences: next },
      create: { userId: user.id, notificationPreferences: next },
    });
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    logger.error('Training confirmation failed:', undefined, { stack: error.stack }, error);
    return NextResponse.json({ ok: false, code: 'SERVER_ERROR' }, { status: 500 });
  }
}
