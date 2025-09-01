import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { NotificationRequestSchema, NotificationResponseSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    const { searchParams } = new URL(request.url);

    const queryParams = {
      type: searchParams.get('type') || undefined,
      read: searchParams.get('read') ? searchParams.get('read') === 'true' : undefined,
      cursor: searchParams.get('cursor') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    const validatedParams = NotificationRequestSchema.parse(queryParams);

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

    // Build where clause
    let whereClause: any = {
      profileId: currentUser.id,
    };

    if (validatedParams.type) {
      whereClause.type = validatedParams.type;
    }

    if (validatedParams.read !== undefined) {
      whereClause.read = validatedParams.read;
    }

    if (validatedParams.cursor) {
      whereClause.createdAt = {
        lt: new Date(validatedParams.cursor),
      };
    }

    // Get notifications
    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: validatedParams.limit + 1, // Take one extra to check if there are more
    });

    const hasMore = notifications.length > validatedParams.limit;
    const notificationsToReturn = hasMore ? notifications.slice(0, -1) : notifications;

    // Get unread count
    const unreadCount = await db.notification.count({
      where: {
        profileId: currentUser.id,
        read: false,
      },
    });

    // Build response
    const responseData = {
      notifications: notificationsToReturn.map((notification) => ({
        id: notification.id,
        profileId: notification.profileId,
        type: notification.type,
        payload: notification.payload as any,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      })),
      unreadCount,
      nextCursor: hasMore
        ? notificationsToReturn[notificationsToReturn.length - 1]?.createdAt.toISOString()
        : undefined,
      hasMore,
    };

    const validatedResponse = NotificationResponseSchema.parse(responseData);

    return NextResponse.json({ ok: true, data: validatedResponse });
  } catch (error) {
    console.error('Notifications fetch error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid query parameters' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return NextResponse.json({ ok: false, error: 'Invalid notification IDs' }, { status: 400 });
    }

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Mark notifications as read
    await db.notification.updateMany({
      where: {
        id: { in: notificationIds },
        profileId: currentUser.id,
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
