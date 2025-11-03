export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

import { db } from '@/lib/db';

const FriendsPresenceSchema = z.object({
  friends: z.array(
    z.object({
      profileId: z.string(),
      status: z.string(),
      lastSeen: z.string(),
      activity: z.unknown(),
      showActivity: z.boolean(),
    }),
  ),
});

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    const friends = await db.user.findMany({
      where: {
        Follow_Follow_followeeIdToUser: { some: { followerId: user.id } },
        Follow_Follow_followerIdToUser: { some: { followeeId: user.id } },
      },
      select: {
        Presence: true,
      },
    });

    const payload = FriendsPresenceSchema.parse({
      friends: friends
        .map((friend) => friend.Presence)
        .filter((presence): presence is NonNullable<typeof presence> => Boolean(presence))
        .map((presence) => ({
          profileId: presence.profileId,
          status: presence.status,
          lastSeen: presence.lastSeen.toISOString(),
          activity: presence.activity,
          showActivity: presence.showActivity,
        })),
    });

    return NextResponse.json({ ok: true, data: payload });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: 'Invalid data' }, { status: 400 });
    }

    console.error('Friends presence error', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
