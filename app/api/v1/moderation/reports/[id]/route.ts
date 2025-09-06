// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/app/lib/db';
import { UserReportUpdateSchema } from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const report = await db.userReport.findUnique({
      where: { id: params.id },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        assignedModerator: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        actions: {
          include: {
            moderator: {
              select: {
                id: true,
                username: true,
                display_name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ ok: false, error: 'Report not found' }, { status: 404 });
    }

    const transformedReport = {
      ...report,
      createdAt: report.createdAt.toISOString(),
      resolvedAt: report.resolvedAt?.toISOString(),
      actions: report.actions.map((action) => ({
        ...action,
        createdAt: action.createdAt.toISOString(),
        expiresAt: action.expiresAt?.toISOString(),
      })),
    };

    return NextResponse.json({
      ok: true,
      data: transformedReport,
    });
  } catch (error) {
    logger.error('Failed to fetch report', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to fetch report' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const validatedData = UserReportUpdateSchema.parse(body);

    // Check if report exists
    const existingReport = await db.userReport.findUnique({
      where: { id: params.id },
    });

    if (!existingReport) {
      return NextResponse.json({ ok: false, error: 'Report not found' }, { status: 404 });
    }

    // Update the report
    const updatedReport = await db.userReport.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        resolvedAt:
          validatedData.status === 'resolved' || validatedData.status === 'dismissed'
            ? new Date()
            : undefined,
      },
      include: {
        reporter: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        reportedUser: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
        assignedModerator: {
          select: {
            id: true,
            username: true,
            display_name: true,
            avatarUrl: true,
          },
        },
      },
    });

    const transformedReport = {
      ...updatedReport,
      createdAt: updatedReport.createdAt.toISOString(),
      resolvedAt: updatedReport.resolvedAt?.toISOString(),
    };

    logger.info('Report updated', {
      extra: {
        reportId: params.id,
        moderatorId: userId,
        updates: Object.keys(validatedData),
      },
    });

    return NextResponse.json({
      ok: true,
      data: transformedReport,
    });
  } catch (error) {
    logger.error('Failed to update report', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to update report' }, { status: 500 });
  }
}
