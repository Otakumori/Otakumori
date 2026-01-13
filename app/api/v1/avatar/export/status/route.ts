import { logger } from '@/app/lib/logger';
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { generateRequestId } from '../../../../../lib/request-id';

export const runtime = 'nodejs';

/**
 * GET /api/v1/avatar/export/status
 * Check the status of an async export job
 * For now, checks the AvatarConfiguration's glbUrl field
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { ok: false, error: 'Authentication required', requestId },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const avatarConfigId = searchParams.get('avatarConfigId');

    if (!jobId && !avatarConfigId) {
      return NextResponse.json(
        { ok: false, error: 'jobId or avatarConfigId is required', requestId },
        { status: 400 },
      );
    }

    // Get user's avatar configuration
    // For simplicity, we check the latest configuration's glbUrl
    // In a full implementation, we'd track jobs in a separate table
    // NOTE: jobId parameter is accepted but not validated for ownership
    // This is acceptable since we always filter by userId to ensure security
    const avatarConfig = await db.avatarConfiguration.findFirst({
      where: { userId }, // CRITICAL: Always filter by authenticated userId for security
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        glbUrl: true,
        glbGeneratedAt: true,
        updatedAt: true,
      },
    });

    if (!avatarConfig) {
      return NextResponse.json(
        { ok: false, error: 'Export job not found', requestId },
        { status: 404 },
      );
    }

    // Check if GLB URL exists (generation completed)
    if (avatarConfig.glbUrl) {
      return NextResponse.json({
        ok: true,
        data: {
          status: 'completed',
          downloadUrl: avatarConfig.glbUrl,
          generatedAt: avatarConfig.glbGeneratedAt,
          format: 'glb',
        },
        requestId,
      });
    }

    // Check if generation might still be in progress
    // If updated recently (within last 5 minutes), assume it's processing
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isRecent = avatarConfig.updatedAt > fiveMinutesAgo;

    return NextResponse.json({
      ok: true,
      data: {
        status: isRecent ? 'processing' : 'pending',
        message: isRecent 
          ? 'Generation in progress. Please check again in a moment.'
          : 'Generation is pending. Please wait a moment and try again.',
        format: 'glb',
      },
      requestId, // Internal tracking only - not shown to user
    });
  } catch (error) {
    logger.error('Export status check error:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Failed to check export status',
      requestId,
    }, { status: 500 });
  }
}

