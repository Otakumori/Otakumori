import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { FollowRequestSchema, FollowResponseSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetId } = FollowRequestSchema.parse(body);

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Check if target user exists
    const targetUser = await db.user.findUnique({
      where: { id: targetId },
    });

    if (!targetUser) {
      return NextResponse.json({ ok: false, error: 'Target user not found' }, { status: 404 });
    }

    // Can't follow yourself
    if (currentUser.id === targetId) {
      return NextResponse.json({ ok: false, error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId: currentUser.id,
          followeeId: targetId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { ok: false, error: 'Already following this user' },
        { status: 400 },
      );
    }

    // Check if blocked
    const isBlocked = await db.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: targetId,
          blockedId: currentUser.id,
        },
      },
    });

    if (isBlocked) {
      return NextResponse.json({ ok: false, error: 'Cannot follow this user' }, { status: 403 });
    }

    // Create follow relationship
    await db.follow.create({
      data: {
        followerId: currentUser.id,
        followeeId: targetId,
      },
    });

    // Get updated follower count
    const followerCount = await db.follow.count({
      where: { followeeId: targetId },
    });

    const response = FollowResponseSchema.parse({
      success: true,
      isFollowing: true,
      followerCount,
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Follow error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetId } = FollowRequestSchema.parse(body);

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Check if following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followeeId: {
          followerId: currentUser.id,
          followeeId: targetId,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json({ ok: false, error: 'Not following this user' }, { status: 400 });
    }

    // Remove follow relationship
    await db.follow.delete({
      where: {
        followerId_followeeId: {
          followerId: currentUser.id,
          followeeId: targetId,
        },
      },
    });

    // Get updated follower count
    const followerCount = await db.follow.count({
      where: { followeeId: targetId },
    });

    const response = FollowResponseSchema.parse({
      success: true,
      isFollowing: false,
      followerCount,
    });

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Unfollow error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
