export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { FriendsPresenceResponseSchema } from '@/app/lib/contracts';



export async function GET(request: NextRequest) {
  try {
    const { userId  } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get mutual followers (friends)
    const friends = await db.user.findMany({
      where: {
        AND: [
          {
            followers: {
              some: { followerId: currentUser.id },
            },
          },
          {
            following: {
              some: { followeeId: currentUser.id },
            },
          },
        ],
      },
      include: {
        presence: true,
      },
    });

    // Get presence data for friends
    const friendsPresence = friends
      .filter((friend) => friend.presence)
      .map((friend) => ({
        profileId: friend.presence!.profileId,
        status: friend.presence!.status,
        lastSeen: friend.presence!.lastSeen.toISOString(),
        activity: friend.presence!.activity as any,
        showActivity: friend.presence!.showActivity,
      }));

    const response = FriendsPresenceResponseSchema.parse({
      friends: friendsPresence,
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Friends presence error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
