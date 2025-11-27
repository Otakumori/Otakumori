
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { ActivityFeedRequestSchema, ActivityFeedResponseSchema } from '@/app/lib/contracts';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);

    const queryParams = {
      scope: searchParams.get('scope') || 'friends',
      type: searchParams.get('type') || undefined,
      cursor: searchParams.get('cursor') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const validatedParams = ActivityFeedRequestSchema.parse(queryParams);

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

    let whereClause: any = {};

    // Build where clause based on scope
    if (validatedParams.scope === 'friends') {
      // Get mutual followers (friends)
      const friends = await db.user.findMany({
        where: {
          AND: [
            {
              Follow_Follow_followeeIdToUser: {
                some: { followerId: currentUser.id },
              },
            },
            {
              Follow_Follow_followerIdToUser: {
                some: { followeeId: currentUser.id },
              },
            },
          ],
        },
        select: { id: true },
      });

      const friendIds = friends.map((f) => f.id);
      friendIds.push(currentUser.id); // Include own activities

      whereClause = {
        profileId: { in: friendIds },
        visibility: { in: ['public', 'friends'] },
      };
    } else if (validatedParams.scope === 'user') {
      whereClause = {
        profileId: currentUser.id,
      };
    } else {
      // Global scope - only public activities
      whereClause = {
        visibility: 'public',
      };
    }

    // Add type filter if specified
    if (validatedParams.type) {
      whereClause.type = validatedParams.type;
    }

    // Add cursor for pagination
    if (validatedParams.cursor) {
      whereClause.createdAt = {
        lt: new Date(validatedParams.cursor),
      };
    }

    // Get activities
    const activities = await db.activity.findMany({
      where: whereClause,
      include: {
        User: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: validatedParams.limit + 1, // Take one extra to check if there are more
    });

    const hasMore = activities.length > validatedParams.limit;
    const activitiesToReturn = hasMore ? activities.slice(0, -1) : activities;

    // Build response
    const responseData = {
      activities: activitiesToReturn.map((activity) => ({
        id: activity.id,
        profileId: activity.profileId,
        type: activity.type,
        payload: activity.payload as any,
        visibility: activity.visibility,
        createdAt: activity.createdAt.toISOString(),
        User: {
          id: activity.User.id,
          username: activity.User.username,
          displayName: activity.User.displayName,
          avatarUrl: activity.User.avatarUrl,
        },
      })),
      nextCursor: hasMore
        ? activitiesToReturn[activitiesToReturn.length - 1]?.createdAt.toISOString()
        : undefined,
      hasMore,
    };

    const validatedResponse = ActivityFeedResponseSchema.parse(responseData);

    return NextResponse.json({ ok: true, data: validatedResponse });
  } catch (error) {
    console.error('Activity feed error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid query parameters' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
