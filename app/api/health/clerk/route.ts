import { logger } from '@/app/lib/logger';
import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    const isProduction = env.NODE_ENV === 'production';
    const domain = request.headers.get('host') || '';

    // Check if we're using production keys
    const isProductionKeys = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_');
    const shouldUseProductionKeys = domain === 'otaku-mori.com' || domain === 'www.otaku-mori.com';

    const healthData: {
      clerk: {
        isConfigured: boolean;
        hasSecretKey: boolean;
        isProductionKeys: boolean;
        shouldUseProductionKeys: boolean;
        domain: string;
        environment: string;
        userId: string | null;
        timestamp: string;
      };
      status: string;
      warnings?: string[];
    } = {
      clerk: {
        isConfigured: !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        hasSecretKey: !!env.CLERK_SECRET_KEY,
        isProductionKeys,
        shouldUseProductionKeys,
        domain,
        environment: isProduction ? 'production' : 'development',
        userId: userId || null,
        timestamp: new Date().toISOString(),
      },
      status: 'healthy',
    };

    // Check for potential misconfigurations
    const warnings = [];

    if (isProduction && isProductionKeys && !shouldUseProductionKeys) {
      warnings.push('Production Clerk keys being used on non-production domain');
    }

    if (!isProduction && isProductionKeys) {
      warnings.push('Production Clerk keys being used in development environment');
    }

    if (warnings.length > 0) {
      healthData.warnings = warnings;
    }

    return NextResponse.json({
      ok: true,
      data: healthData,
      requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  } catch (error) {
    logger.error(
      'Clerk health check failed:',
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
    );

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'CLERK_HEALTH_CHECK_FAILED',
          message: 'Clerk health check failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        requestId: `otm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
      { status: 500 },
    );
  }
}
