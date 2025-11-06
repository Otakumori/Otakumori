// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommentUpdateSchema } from '@/app/lib/contracts';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export const runtime = 'nodejs';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CommentUpdateSchema.parse(body);

    // Get current user
    const db = await getDb();
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get comment and verify ownership
    const comment = await db.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment) {
      return NextResponse.json({ ok: false, error: 'Comment not found' }, { status: 404 });
    }

    if (comment.authorId !== currentUser.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized to edit this comment' },
        { status: 403 },
      );
    }

    if (comment.isDeleted || comment.isModerated) {
      return NextResponse.json(
        { ok: false, error: 'Cannot edit deleted or moderated comment' },
        { status: 400 },
      );
    }

    // Update comment
    const updatedComment = await db.comment.update({
      where: { id: params.id },
      data: {
        content: validatedData.content,
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const response = {
      id: updatedComment.id,
      content: updatedComment.content,
      authorId: updatedComment.authorId,
      parentId: updatedComment.parentId,
      contentType: updatedComment.contentType,
      contentId: updatedComment.contentId,
      isDeleted: updatedComment.isDeleted,
      isModerated: updatedComment.isModerated,
      moderationReason: updatedComment.moderationReason,
      likeCount: updatedComment.likeCount,
      replyCount: updatedComment.replyCount,
      createdAt: updatedComment.createdAt.toISOString(),
      updatedAt: updatedComment.updatedAt.toISOString(),
      author: updatedComment.User,
    };

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Comment update error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user
    const db = await getDb();
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Get comment and verify ownership
    const comment = await db.comment.findUnique({
      where: { id: params.id },
    });

    if (!comment) {
      return NextResponse.json({ ok: false, error: 'Comment not found' }, { status: 404 });
    }

    if (comment.authorId !== currentUser.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized to delete this comment' },
        { status: 403 },
      );
    }

    // Soft delete comment
    await db.comment.update({
      where: { id: params.id },
      data: {
        isDeleted: true,
        content: '[deleted]',
        updatedAt: new Date(),
      },
    });

    // Update parent comment's reply count if this was a reply
    if (comment.parentId) {
      await db.comment.update({
        where: { id: comment.parentId },
        data: { replyCount: { decrement: 1 } },
      });
    }

    return NextResponse.json({ ok: true, data: { success: true } });
  } catch (error) {
    console.error('Comment deletion error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
