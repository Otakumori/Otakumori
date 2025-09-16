// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CommentReportSchema } from '@/app/lib/contracts';

async function getDb() {
  const { db } = await import('@/lib/db');
  return db;
}

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = CommentReportSchema.parse(body);

    // Get current user
    const db = await getDb();
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

    if (!comment) {
      return NextResponse.json({ ok: false, error: 'Comment not found' }, { status: 404 });
    }

    // Check if user already reported this comment
    const existingReport = await db.commentReport.findUnique({
      where: {
        commentId_reporterId: {
          commentId: validatedData.commentId,
          reporterId: currentUser.id,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json({ ok: false, error: 'Comment already reported' }, { status: 400 });
    }

    // Create report
    await db.commentReport.create({
      data: {
        commentId: validatedData.commentId,
        reporterId: currentUser.id,
        reason: validatedData.reason,
        description: validatedData.description,
      },
    });

    // Auto-moderate if multiple reports
    const reportCount = await db.commentReport.count({
      where: { commentId: validatedData.commentId },
    });

    if (reportCount >= 3) {
      await db.comment.update({
        where: { id: validatedData.commentId },
        data: {
          isModerated: true,
          moderationReason: 'Multiple reports received',
        },
      });
    }

    return NextResponse.json({ ok: true, data: { success: true, reportCount } });
  } catch (error) {
    console.error('Comment report error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ ok: false, error: 'Invalid input data' }, { status: 400 });
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
