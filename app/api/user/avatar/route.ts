export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const PrefsSchema = z.object({
  DIRTY_PREF: z.boolean().default(false),
  ALLOW_ACCIDENTAL: z.boolean().default(false),
  AUTO_ACCEPT_PLAYFUL: z.boolean().default(false),
  JIGGLE_VISIBLE: z.boolean().default(false),
  CRT: z.boolean().default(false),
  VHS: z.boolean().default(false),
  AUDIO: z.boolean().default(true),
  AUDIO_LEVEL: z.number().min(0).max(100).optional(),
});

const AvatarUpsertSchema = z.object({
  avatar: z
    .object({
      url: z.string().url().optional(),
      // room for mesh/options in future
    })
    .optional(),
  prefs: PrefsSchema.optional(),
});

function mergeCardPrefs(existing: any, incoming: z.infer<typeof PrefsSchema>) {
  const prevCard = existing?.card ?? {};
  const card = { ...prevCard, ...incoming };
  return { ...existing, card };
}

function extractPrefsFromSettings(settings: any): z.infer<typeof PrefsSchema> {
  const card = settings?.card ?? {};
  return {
    DIRTY_PREF: !!card.DIRTY_PREF,
    ALLOW_ACCIDENTAL: !!card.ALLOW_ACCIDENTAL,
    AUTO_ACCEPT_PLAYFUL: !!card.AUTO_ACCEPT_PLAYFUL,
    JIGGLE_VISIBLE: !!card.JIGGLE_VISIBLE,
    CRT: !!card.CRT,
    VHS: !!card.VHS,
    AUDIO: card.AUDIO === undefined ? true : !!card.AUDIO,
    AUDIO_LEVEL:
      typeof card.AUDIO_LEVEL === 'number'
        ? Math.min(100, Math.max(0, card.AUDIO_LEVEL))
        : undefined,
  };
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, avatarUrl: true, userSettings: true },
    });
    if (!user)
      return NextResponse.json(
        { ok: false, code: 'NOT_FOUND', message: 'User not found' },
        { status: 404 },
      );

    const settings = user.userSettings?.notificationPreferences as any;
    const prefs = extractPrefsFromSettings(settings);

    const data = {
      avatar: user.avatarUrl ? { url: user.avatarUrl } : undefined,
      prefs,
    };
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error('user/avatar GET error', err);
    return NextResponse.json(
      { ok: false, code: 'SERVER_ERROR', message: 'Internal error' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const parsed = AvatarUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, code: 'INVALID_INPUT', message: parsed.error.message },
        { status: 400 },
      );
    }
    const input = parsed.data;

    const user = await db.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
    if (!user) return NextResponse.json({ ok: false, code: 'NOT_FOUND' }, { status: 404 });

    // Update avatar if provided
    if (input.avatar?.url) {
      await db.user.update({ where: { id: user.id }, data: { avatarUrl: input.avatar.url } });
    }

    // Merge prefs into UserSettings.notificationPreferences JSON under .card
    if (input.prefs) {
      const current = await db.userSettings.findUnique({ where: { userId: user.id } });
      const existing = (current?.notificationPreferences as any) ?? {};
      const merged = mergeCardPrefs(existing, input.prefs);
      await db.userSettings.upsert({
        where: { userId: user.id },
        update: {
          notificationPreferences: merged,
          soundEnabled: input.prefs.AUDIO,
          musicEnabled: input.prefs.AUDIO,
        },
        create: {
          userId: user.id,
          notificationPreferences: merged,
          soundEnabled: input.prefs.AUDIO,
          musicEnabled: input.prefs.AUDIO,
        },
      });
    }

    // Return GET payload shape
    const settings = await db.userSettings.findUnique({ where: { userId: user.id } });
    const prefs = extractPrefsFromSettings(settings?.notificationPreferences as any);
    const avatarUser = await db.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });
    return NextResponse.json({
      ok: true,
      data: { avatar: avatarUser?.avatarUrl ? { url: avatarUser.avatarUrl } : undefined, prefs },
    });
  } catch (err) {
    console.error('user/avatar POST error', err);
    return NextResponse.json(
      { ok: false, code: 'SERVER_ERROR', message: 'Internal error' },
      { status: 500 },
    );
  }
}
