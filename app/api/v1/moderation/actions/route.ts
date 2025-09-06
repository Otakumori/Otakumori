// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { ModerationActionCreateSchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has moderator permissions
    const moderatorRole = await db.moderatorRole.findFirst({
      where: {
        userId: userId,
        isActive: true,
      },
    });

    if (!moderatorRole) {
      return NextResponse.json({ ok: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = ModerationActionCreateSchema.parse(body);

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!targetUser) {
      return NextResponse.json({ ok: false, error: 'Target user not found' }, { status: 404 });
    }

    // Check if user is trying to moderate themselves
    if (validatedData.userId === userId) {
      return NextResponse.json({ ok: false, error: 'Cannot moderate yourself' }, { status: 400 });
    }

    // Check if there's already an active action of the same type
    if (validatedData.actionType === 'suspension' || validatedData.actionType === 'ban') {
      const existingAction = await db.moderationAction.findFirst({
        where: {
          userId: validatedData.userId,
          actionType: validatedData.actionType,
          isActive: true,
        },
      });

      if (existingAction) {
        return NextResponse.json(
          {
            ok: false,
            error: `User already has an active ${validatedData.actionType}`,
          },
          { status: 400 },
        );
      }
    }

    // Create the moderation action
    const action = await db.moderationAction.create({
      data: {
        ...validatedData,
        moderatorId: userId,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        moderator: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        report: {
          select: {
            id: true,
            reason: true,
            description: true,
          },
        },
      },
    });

    const transformedAction = {
      ...action,
      createdAt: action.createdAt.toISOString(),
      expiresAt: action.expiresAt?.toISOString(),
    };

    // Create notification for the user
    await db.notification.create({
      data: {
        profileId: validatedData.userId,
        type: 'moderation_action',
        payload: {
          actionType: validatedData.actionType,
          reason: validatedData.reason,
          moderator: action.moderator.username,
          expiresAt: validatedData.expiresAt,
        },
      },
    });

    logger.info('Moderation action created', {
      extra: {
        actionId: action.id,
        moderatorId: userId,
        targetUserId: validatedData.userId,
        actionType: validatedData.actionType,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: transformedAction,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('Failed to create moderation action', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to create moderation action' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has moderator permissions
    const moderatorRole = await db.moderatorRole.findFirst({
      where: {
        userId: userId,
        isActive: true,
      },
    });

    if (!moderatorRole) {
      return NextResponse.json({ ok: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    const actionType = searchParams.get('actionType');
    const isActive = searchParams.get('isActive');

    const where: any = {};
    if (targetUserId) where.userId = targetUserId;
    if (actionType) where.actionType = actionType;
    if (isActive !== null) where.isActive = isActive === 'true';

    const actions = await db.moderationAction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        moderator: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        report: {
          select: {
            id: true,
            reason: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const transformedActions = actions.map((action) => ({
      ...action,
      createdAt: action.createdAt.toISOString(),
      expiresAt: action.expiresAt?.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      data: transformedActions,
    });
  } catch (error) {
    logger.error('Failed to fetch moderation actions', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch moderation actions' },
      { status: 500 },
    );
  }
}
