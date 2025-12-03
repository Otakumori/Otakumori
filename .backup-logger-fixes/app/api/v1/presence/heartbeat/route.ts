export const runtime = 'nodejs';

import { logger } from '@/app/lib/logger';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { db } from '@/lib/db';

const HeartbeatSchema = z.object({
  status: z.string().min(1),
  activity: z.unknown().optional(),
  showActivity: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = HeartbeatSchema.parse(await request.json());

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const now = new Date();

    const presence = await db.presence.upsert({
      where: { profileId: user.id },
      update: {
        status: payload.status,
        activity: payload.activity ?? {},
        ...(typeof payload.showActivity === 'boolean'
          ? { showActivity: payload.showActivity }
          : {}),
        lastSeen: now,
      },
      create: {
        profileId: user.id,
        status: payload.status,
        activity: payload.activity ?? {},
        showActivity: payload.showActivity ?? true,
        lastSeen: now,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        profileId: presence.profileId,
        status: presence.status,
        lastSeen: presence.lastSeen.toISOString(),
        activity: presence.activity,
        showActivity: presence.showActivity,
        updatedAt: presence.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    logger.error('Presence heartbeat error', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
