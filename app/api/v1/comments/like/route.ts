// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { CommentLikeSchema } from '@/app/lib/contracts';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CommentLikeSchema.parse(body);

    // Get current user
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Check if comment exists
    const comment = await db.comment.findUnique({
      where: { id: validatedData.commentId },
    });

    if (!comment || comment.isDeleted || comment.isModerated) {
      return NextResponse.json({ ok: false, error: 'Comment not found' }, { status: 404 });
    }

    // Check if user already liked this comment
    const existingLike = await db.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId: validatedData.commentId,
          userId: currentUser.id,
        },
      },
    });

    if (existingLike) {
      // Unlike the comment
      await db.commentLike.delete({
        where: { id: existingLike.id },
      });

      // Decrement like count
      await db.comment.update({
        where: { id: validatedData.commentId },
        data: { likeCount: { decrement: 1 } },
      });

      return NextResponse.json({
        ok: true,
        data: { liked: false, likeCount: comment.likeCount - 1 },
      });
    } else {
      // Like the comment
      await db.commentLike.create({
        data: {
          commentId: validatedData.commentId,
          userId: currentUser.id,
        },
      });

      // Increment like count
      await db.comment.update({
        where: { id: validatedData.commentId },
        data: { likeCount: { increment: 1 } },
      });

      return NextResponse.json({
        ok: true,
        data: { liked: true, likeCount: comment.likeCount + 1 },
      });
    }
  } catch (error) {
    console.error('Comment like error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
