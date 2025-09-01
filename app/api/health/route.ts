import { NextResponse } from 'next/server';
import { getEnvHealth } from '@/app/lib/env-schema';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const envHealth = getEnvHealth();

    // Check database connection
    let dbStatus = 'unknown';
    try {
      const { prisma } = await import('@/app/lib/prisma');
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
    } catch (error) {
      console.error('Database health check failed:', error);
      dbStatus = 'down';
    }

    // Check Printify API
    let printifyStatus = 'unknown';
    try {
      const key = env.PRINTIFY_API_KEY;
      const store = env.PRINTIFY_SHOP_ID;

      if (key && store) {
        const res = await fetch(`https://api.printify.com/v1/shops/${store}/products.json`, {
          headers: { Authorization: `Bearer ${key}` },
          cache: 'no-store',
        });
        printifyStatus = res.ok ? 'up' : 'down';
      } else {
        printifyStatus = 'missing-env';
      }
    } catch (error) {
      console.error('Printify health check failed:', error);
      printifyStatus = 'down';
    }

    // Check Clerk (basic connectivity)
    let clerkStatus = 'unknown';
    try {
      const key = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
      if (key) {
        // Simple check - try to parse the key format
        if (key.startsWith('pk_test_') || key.startsWith('pk_live_')) {
          clerkStatus = 'up';
        } else {
          clerkStatus = 'invalid-format';
        }
      } else {
        clerkStatus = 'missing-env';
      }
    } catch (error) {
      console.error('Clerk health check failed:', error);
      clerkStatus = 'down';
    }

    const health = {
      status: 'healthy',
      version: '1.0.0', // Static version for now
      environment: 'production', // Static environment for now
      timestamp: new Date().toISOString(),
      services: {
        clerk: clerkStatus,
        database: dbStatus,
        printify: printifyStatus,
      },
      env: envHealth,
    };

    // Overall status based on critical services
    if (dbStatus === 'down' || clerkStatus === 'down') {
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
