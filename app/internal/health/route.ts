import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

/**
 * Internal health check endpoint for monitoring
 * Only accessible in development or with proper authentication
 */
export async function GET(request: NextRequest) {
  // Only allow in development or with proper auth header
  const isDev = env.NODE_ENV === 'development';
  const authHeader = request.headers.get('x-internal-auth');
  const expectedAuth = env.INTERNAL_AUTH_TOKEN || 'dev-only';

  if (!isDev && authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      version: '1.0.0',
      features: {
        liveData: env.NEXT_PUBLIC_LIVE_DATA === '1',
        probeMode: env.NEXT_PUBLIC_PROBE_MODE === '1',
        hero: env.NEXT_PUBLIC_FEATURE_HERO === '1',
        petals: env.NEXT_PUBLIC_FEATURE_PETALS_INTERACTIVE === '1',
        shop: env.NEXT_PUBLIC_FEATURE_SHOP === '1',
        minigames: env.NEXT_PUBLIC_FEATURE_MINIGAMES === '1',
        blog: env.NEXT_PUBLIC_FEATURE_BLOG === '1',
        soapstones: env.NEXT_PUBLIC_FEATURE_SOAPSTONES === '1',
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
      // Webhook health (placeholder - would be populated from actual webhook logs)
      webhooks: {
        lastSuccess: '2024-01-01T00:00:00Z', // Masked timestamp
        status: 'operational',
      },
    };

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
