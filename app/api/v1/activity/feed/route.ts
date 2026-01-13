import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { generateRequestId } from '@/lib/request-id';
import { withRateLimit } from '@/app/lib/rate-limiting';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  return withRateLimit('activity-feed-get', async () => {
    const requestId = generateRequestId();

    try {
      const { userId: clerkId } = await auth();
      if (!clerkId) {
        return NextResponse.json(
          { ok: false, error: 'Authentication required', requestId },
          { status: 401, headers: { 'x-otm-reason': 'AUTH_REQUIRED' } },
        );
      }

      // Convert Clerk ID to database user ID
      const user = await db.user.findUnique({
        where: { clerkId },
        select: { id: true },
      });

      if (!user) {
        return NextResponse.json(
          { ok: false, error: 'User not found', requestId },
          { status: 404 },
        );
      }

      // Get query parameters
      const { searchParams } = new URL(req.url);
      const limit = parseInt(searchParams.get('limit') || '10', 10);
      const offset = parseInt(searchParams.get('offset') || '0', 10);
      const type = searchParams.get('type'); // Optional filter by activity type

      // Query recent activities
      const activities = await db.activity.findMany({
        where: {
          profileId: user.id,
          ...(type && { type }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: Math.min(limit, 50), // Cap at 50
        skip: offset,
      });

      // Format activities for frontend
      const formattedActivities = activities.map((activity) => {
        const payload = activity.payload as any;
        let text = '';
        let icon = '🌸';

        switch (activity.type) {
          case 'game':
            text = `Played ${payload.gameName || payload.gameId || 'a game'}`;
            if (payload.score) {
              text += ` (Score: ${payload.score.toLocaleString()})`;
            }
            icon = '🎮';
            break;
          case 'achievement':
            text = `Unlocked "${payload.name || payload.achievementName || 'Achievement'}"`;
            icon = '🏆';
            break;
          case 'cosmetic':
            text = `Purchased ${payload.itemName || payload.cosmeticName || 'a cosmetic'}`;
            icon = '✨';
            break;
          case 'petal':
            text = `Earned ${payload.amount || 0} petals`;
            if (payload.source) {
              text += ` from ${payload.source}`;
            }
            icon = '🌸';
            break;
          case 'order':
            text = `Ordered ${payload.itemName || 'items'}`;
            icon = '📦';
            break;
          default:
            text = payload.message || payload.text || 'Activity';
        }

        // Calculate relative time
        const now = new Date();
        const createdAt = new Date(activity.createdAt);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        let timeAgo = '';
        if (diffMins < 1) {
          timeAgo = 'Just now';
        } else if (diffMins < 60) {
          timeAgo = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffHours < 24) {
          timeAgo = `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else if (diffDays < 7) {
          timeAgo = `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        } else {
          timeAgo = createdAt.toLocaleDateString();
        }

        return {
          id: activity.id,
          type: activity.type,
          text,
          icon,
          time: timeAgo,
          createdAt: activity.createdAt.toISOString(),
          payload,
        };
      });

      return NextResponse.json({
        ok: true,
        data: {
          activities: formattedActivities,
          total: formattedActivities.length,
          hasMore: activities.length === limit,
        },
        requestId,
      });
    } catch (error) {
      console.error('Activity feed error:', error);
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to fetch activity feed',
          requestId,
        },
        { status: 500 },
      );
    }
  });
}

