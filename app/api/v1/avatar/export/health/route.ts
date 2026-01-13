import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateRequestId } from '../../../../../lib/request-id';
import { logger } from '@/app/lib/logger';

export const runtime = 'nodejs';

/**
 * GET /api/v1/avatar/export/health
 * Health check endpoint for export service
 * Checks database connectivity, blob storage availability, and recent export success rate
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();

  const health = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'unknown' as 'ok' | 'error' | 'unknown', latency: 0 },
      blobStorage: { status: 'unknown' as 'ok' | 'error' | 'unknown' },
      recentExports: { status: 'unknown' as 'ok' | 'error' | 'unknown', successRate: 0 },
    },
    version: process.env.npm_package_version || '1.0.0',
    requestId,
  };

  try {
    // Check database connectivity
    try {
      const dbStart = Date.now();
      await db.$queryRaw`SELECT 1`;
      health.checks.database.latency = Date.now() - dbStart;
      health.checks.database.status = 'ok';
    } catch (error) {
      health.checks.database.status = 'error';
      health.status = 'unhealthy';
      logger.error('Export health check: Database error', undefined, { requestId }, error instanceof Error ? error : new Error(String(error)));
    }

    // Check blob storage (simplified - just verify we can import the client)
    try {
      // Dynamic import to avoid issues if blob client isn't available
      await import('@/app/lib/blob/client');
      health.checks.blobStorage.status = 'ok';
    } catch (error) {
      health.checks.blobStorage.status = 'error';
      health.status = health.status === 'healthy' ? 'degraded' : 'unhealthy';
      logger.warn('Export health check: Blob storage check failed', undefined, { requestId });
    }

    // Check recent export success rate (last 24 hours)
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Count recent avatar configurations with glbUrl (successful exports)
      const recentExports = await db.avatarConfiguration.count({
        where: {
          glbGeneratedAt: {
            gte: oneDayAgo,
          },
          glbUrl: {
            not: null,
          },
        },
      });

      // Count total recent updates (attempts)
      const recentAttempts = await db.avatarConfiguration.count({
        where: {
          updatedAt: {
            gte: oneDayAgo,
          },
        },
      });

      if (recentAttempts > 0) {
        const successRate = (recentExports / recentAttempts) * 100;
        health.checks.recentExports.successRate = Math.round(successRate * 100) / 100;
        
        // Consider degraded if success rate is below 80%
        if (successRate < 80) {
          health.checks.recentExports.status = 'error';
          health.status = health.status === 'healthy' ? 'degraded' : 'unhealthy';
        } else {
          health.checks.recentExports.status = 'ok';
        }
      } else {
        // No recent exports - consider it ok (service might be idle)
        health.checks.recentExports.status = 'ok';
        health.checks.recentExports.successRate = 100;
      }
    } catch (error) {
      health.checks.recentExports.status = 'error';
      health.status = health.status === 'healthy' ? 'degraded' : 'unhealthy';
      logger.warn('Export health check: Recent exports check failed', undefined, { requestId });
    }

    const duration = Date.now() - startTime;
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    return NextResponse.json(
      {
        ...health,
        duration,
      },
      { status: statusCode },
    );
  } catch (error) {
    logger.error('Export health check failed', undefined, { requestId }, error instanceof Error ? error : new Error(String(error)));
    
    return NextResponse.json(
      {
        ...health,
        status: 'unhealthy',
        error: 'Health check failed',
        duration: Date.now() - startTime,
        requestId,
      },
      { status: 503 },
    );
  }
}

