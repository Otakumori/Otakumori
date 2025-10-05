import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function GET() {
  try {
    const startTime = Date.now();

    // Check database connection
    const { db } = await import('@/lib/db');
    await db.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - startTime;

    // Get environment info
    const environment = {
      nodeEnv: env.NODE_ENV,
      vercelEnv: (env as any).VERCEL_ENV,
      region: (env as any).VERCEL_REGION,
      featureAdultZone: (env as any).FEATURE_ADULT_ZONE === 'true',
      featureLiveData: env.NEXT_PUBLIC_LIVE_DATA === '1',
    };

    // Get feature flags
    const featureFlags = {
      adultZone: environment.featureAdultZone,
      liveData: environment.featureLiveData,
      analytics: !!env.NEXT_PUBLIC_POSTHOG_KEY,
      payments: !!env.STRIPE_SECRET_KEY,
      printify: !!env.PRINTIFY_API_KEY,
    };

    // Get system info
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
      platform: process.platform,
    };

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: (env as any).npm_package_version || '1.0.0',
      environment,
      featureFlags,
      system: systemInfo,
      database: {
        status: 'connected',
        latency: `${dbLatency}ms`,
      },
      services: {
        clerk: !!env.CLERK_SECRET_KEY,
        stripe: !!env.STRIPE_SECRET_KEY,
        printify: !!env.PRINTIFY_API_KEY,
        posthog: !!env.NEXT_PUBLIC_POSTHOG_KEY,
        resend: !!env.RESEND_API_KEY,
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
    console.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    );
  }
}

export const runtime = 'nodejs';
