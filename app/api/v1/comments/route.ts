// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  CommentCreateSchema,
  CommentListRequestSchema,
  CommentListResponseSchema,
} from '@/app/lib/contracts';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const { searchParams } = new URL(request.url);

    const queryParams = {
      contentType: searchParams.get('contentType') || 'profile',
      contentId: searchParams.get('contentId') || '',
      parentId: searchParams.get('parentId') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validatedParams = CommentListRequestSchema.parse(queryParams);

    // Get database connection
    const db = await getDb();

    // Get current user if authenticated
    let currentUser = null;
    if (userId) {
      currentUser = await db.user.findUnique({
        where: { clerkId: userId },
      });
    }

    // Build where clause
    const whereClause: any = {
      contentType: validatedParams.contentType,
      contentId: validatedParams.contentId,
      isDeleted: false,
      isModerated: false,
    };

    if (validatedParams.parentId) {
      whereClause.parentId = validatedParams.parentId;
    } else {
      whereClause.parentId = null; // Top-level comments only
    }

    // Get comments with author info
    const [comments, totalCount] = await Promise.all([
      db.comment.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatarUrl: true,
            },
          },
          likes: currentUser
            ? {
                where: { userId: currentUser.id },
                select: { id: true },
              }
            : false,
        },
        orderBy: { createdAt: 'desc' },
        take: validatedParams.limit,
        skip: validatedParams.offset,
      }),
      db.comment.count({ where: whereClause }),
    ]);

    // Transform comments
    const transformedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      authorId: comment.authorId,
      parentId: comment.parentId,
      contentType: comment.contentType,
      contentId: comment.contentId,
      isDeleted: comment.isDeleted,
      isModerated: comment.isModerated,
      moderationReason: comment.moderationReason,
      likeCount: comment.likeCount,
      replyCount: comment.replyCount,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
      author: comment.author,
      isLiked: currentUser ? comment.likes && comment.likes.length > 0 : false,
    }));

    const responseData = {
      comments: transformedComments,
      totalCount,
      hasMore: validatedParams.offset + validatedParams.limit < totalCount,
    };

    const validatedResponse = CommentListResponseSchema.parse(responseData);

    return NextResponse.json({ ok: true, data: validatedResponse });
  } catch (error) {
    console.error('Comments fetch error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid query parameters' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CommentCreateSchema.parse(body);

    // Get current user
    const db = await getDb();
    const currentUser = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!currentUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // Check if parent comment exists (for replies)
    if (validatedData.parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: validatedData.parentId },
      });

      if (!parentComment || parentComment.isDeleted || parentComment.isModerated) {
        return NextResponse.json({ ok: false, error: 'Parent comment not found' }, { status: 404 });
      }

      // Update parent comment's reply count
      await db.comment.update({
        where: { id: validatedData.parentId },
        data: { replyCount: { increment: 1 } },
      });
    }

    // Create comment
    const newComment = await db.comment.create({
      data: {
        content: validatedData.content,
        authorId: currentUser.id,
        parentId: validatedData.parentId,
        contentType: validatedData.contentType,
        contentId: validatedData.contentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create activity for the comment
    await db.activity.create({
      data: {
        profileId: currentUser.id,
        type: 'comment',
        payload: {
          commentId: newComment.id,
          contentType: validatedData.contentType,
          contentId: validatedData.contentId,
          parentId: validatedData.parentId,
        },
        visibility: 'public',
      },
    });

    const response = {
      id: newComment.id,
      content: newComment.content,
      authorId: newComment.authorId,
      parentId: newComment.parentId,
      contentType: newComment.contentType,
      contentId: newComment.contentId,
      isDeleted: newComment.isDeleted,
      isModerated: newComment.isModerated,
      moderationReason: newComment.moderationReason,
      likeCount: newComment.likeCount,
      replyCount: newComment.replyCount,
      createdAt: newComment.createdAt.toISOString(),
      updatedAt: newComment.updatedAt.toISOString(),
      author: newComment.author,
      isLiked: false,
    };

    return NextResponse.json({ ok: true, data: response });
  } catch (error) {
    console.error('Comment creation error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
