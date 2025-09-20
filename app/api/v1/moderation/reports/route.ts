// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import {
  UserReportCreateSchema,
  ReportListRequestSchema,
  UserReportSchema,
} from '@/app/lib/contracts';
import { logger } from '@/app/lib/logger';

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
    const query = {
      status: searchParams.get('status') || undefined,
      priority: searchParams.get('priority') || undefined,
      contentType: searchParams.get('contentType') || undefined,
      assignedModeratorId: searchParams.get('assignedModeratorId') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    const validatedQuery = ReportListRequestSchema.parse(query);

    // Build where clause
    const where: any = {};
    if (validatedQuery.status) where.status = validatedQuery.status;
    if (validatedQuery.priority) where.priority = validatedQuery.priority;
    if (validatedQuery.contentType) where.contentType = validatedQuery.contentType;
    if (validatedQuery.assignedModeratorId)
      where.assignedModeratorId = validatedQuery.assignedModeratorId;

    // Get reports with related data
    const [reports, totalCount] = await Promise.all([
      db.userReport.findMany({
        where,
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
        orderBy: [
          { priority: 'desc' }, // urgent, high, medium, low
          { createdAt: 'desc' },
        ],
        take: validatedQuery.limit,
        skip: validatedQuery.offset,
      }),
      db.userReport.count({ where }),
    ]);

    const transformedReports = reports.map((report) => ({
      ...report,
      createdAt: report.createdAt.toISOString(),
      resolvedAt: report.resolvedAt?.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      data: {
        reports: transformedReports,
        totalCount,
        hasMore: validatedQuery.offset + validatedQuery.limit < totalCount,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch reports', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UserReportCreateSchema.parse(body);

    // Check if user is trying to report themselves
    if (validatedData.reportedUserId === userId) {
      return NextResponse.json({ ok: false, error: 'Cannot report yourself' }, { status: 400 });
    }

    // Check if user has already reported this content
    const existingReportWhere: Prisma.UserReportWhereInput = {
      reporterId: userId,
      contentType: validatedData.contentType,
      status: {
        in: ['pending', 'reviewed'],
      },
    };
    if (validatedData.contentId !== undefined) {
      existingReportWhere.contentId = validatedData.contentId;
    }
    if (validatedData.reportedUserId !== undefined) {
      existingReportWhere.reportedUserId = validatedData.reportedUserId ?? null;
    }

    const existingReport = await db.userReport.findFirst({
      where: existingReportWhere,
    });

    if (existingReport) {
      return NextResponse.json(
        { ok: false, error: 'You have already reported this content' },
        { status: 400 },
      );
    }

    const reportData: Prisma.UserReportUncheckedCreateInput = {
      reporterId: userId,
      contentType: validatedData.contentType,
      reason: validatedData.reason,
    };
    if (validatedData.reportedUserId !== undefined) {
      reportData.reportedUserId = validatedData.reportedUserId ?? null;
    }
    if (validatedData.contentId !== undefined) {
      reportData.contentId = validatedData.contentId;
    }
    if (validatedData.description !== undefined) {
      reportData.description = validatedData.description;
    }
    if (validatedData.evidence !== undefined) {
      reportData.evidence = validatedData.evidence;
    }

    // Create the report
    const report = await db.userReport.create({
      data: reportData,
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
      },
    });

    const transformedReport = {
      ...report,
      createdAt: report.createdAt.toISOString(),
      resolvedAt: report.resolvedAt?.toISOString(),
    };

    logger.info('User report created', {
      extra: {
        reportId: report.id,
        reporterId: userId,
        contentType: validatedData.contentType,
        reason: validatedData.reason,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        data: transformedReport,
      },
      { status: 201 },
    );
  } catch (error) {
    logger.error('Failed to create report', {
      extra: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    return NextResponse.json({ ok: false, error: 'Failed to create report' }, { status: 500 });
  }
}
