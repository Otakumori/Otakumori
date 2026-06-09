import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export const GET = withAdminAuth(async (request: NextRequest) => {
  try {
    const envStatus = {
      PRINTIFY_API_KEY: !!env.PRINTIFY_API_KEY ? 'Set' : 'Missing',
      PRINTIFY_SHOP_ID: !!env.PRINTIFY_SHOP_ID ? 'Set' : 'Missing',
      PRINTIFY_API_URL: !!env.PRINTIFY_API_URL ? 'Set' : 'Missing',

      CLERK_SECRET_KEY: !!env.CLERK_SECRET_KEY ? 'Set' : 'Missing',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        ? 'Set'
        : 'Missing',
      NEXT_PUBLIC_CLERK_DOMAIN: !!env.NEXT_PUBLIC_CLERK_DOMAIN ? 'Set' : 'Missing',

      DATABASE_URL: !!env.DATABASE_URL ? 'Set' : 'Missing',
      DIRECT_URL: !!env.DIRECT_URL ? 'Set' : 'Missing',

      NEXT_PUBLIC_APP_URL: !!env.NEXT_PUBLIC_APP_URL ? 'Set' : 'Missing',
      NODE_ENV: env.NODE_ENV,
      VERCEL_ENVIRONMENT: !!env.VERCEL_ENVIRONMENT ? 'Set' : 'Missing',
    };

    const isProductionClerk = env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_');
    const currentDomain = request.headers.get('host') || 'unknown';

    return NextResponse.json({
      ok: true,
      data: {
        envStatus,
        domainInfo: {
          currentDomain,
          isProductionClerk,
          recommendedAction:
            isProductionClerk && currentDomain !== 'otaku-mori.com'
              ? 'Use development Clerk keys for non-production domains'
              : 'Configuration looks correct',
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
});
