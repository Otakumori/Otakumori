import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { z } from 'zod';
import { logger } from '@/app/lib/logger';

const BlockUserSchema = z.object({
  userId: z.string(),
  action: z.enum(['block', 'unblock']),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = BlockUserSchema.parse(body);

    // Check if user is trying to block themselves
    if (validatedData.userId === userId) {
      return NextResponse.json({ ok: false, error: 'Cannot block yourself' }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: validatedData.userId },
    });

    if (!targetUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get current safety settings
    let settings = await db.userSafetySettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await db.userSafetySettings.create({
        data: { userId },
      });
    }

    const blockedUsers = settings.blockedUsers || [];

    if (validatedData.action === 'block') {
      // Add user to blocked list if not already blocked
      if (!blockedUsers.includes(validatedData.userId)) {
        await db.userSafetySettings.update({
          where: { userId },
          data: {
            blockedUsers: [...blockedUsers, validatedData.userId],
          },
        });

        // Also create a block record in the Block table for consistency
        await db.block.upsert({
          where: {
            blockerId_blockedId: {
              blockerId: userId,
              blockedId: validatedData.userId,
            },
          },
          update: {},
          create: {
            blockerId: userId,
            blockedId: validatedData.userId,
          },
        });

        logger.info('User blocked', {
          extra: {
            blockerId: userId,
            blockedId: validatedData.userId,
          },
        });
      }
    } else {
      // Remove user from blocked list
      const updatedBlockedUsers = blockedUsers.filter((id) => id !== validatedData.userId);

      await db.userSafetySettings.update({
        where: { userId },
        data: {
          blockedUsers: updatedBlockedUsers,
        },
      });

      // Remove block record
      await db.block.deleteMany({
        where: {
          blockerId: userId,
          blockedId: validatedData.userId,
        },
      });

      logger.info('User unblocked', {
        extra: {
          blockerId: userId,
          blockedId: validatedData.userId,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      data: { message: `User ${validatedData.action}ed successfully` },
    });
  } catch (error) {
    logger.error('Failed to block/unblock user', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to block/unblock user' }, { status: 500 });
  }
}
