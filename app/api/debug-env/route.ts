import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Only allow this endpoint in development or with specific admin key
    const isDevelopment = env.NODE_ENV === 'development';
    const adminKey = request.headers.get('x-admin-key');
    const isAuthorized = isDevelopment || adminKey === env.NEXT_PUBLIC_ADMIN_API_KEY;

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check critical environment variables
    const envStatus = {
      // Printify
      PRINTIFY_API_KEY: !!env.PRINTIFY_API_KEY ? 'Set' : 'Missing',
      PRINTIFY_SHOP_ID: !!env.PRINTIFY_SHOP_ID ? 'Set' : 'Missing',
      PRINTIFY_API_URL: !!env.PRINTIFY_API_URL ? 'Set' : 'Missing',

      // Clerk
      CLERK_SECRET_KEY: !!env.CLERK_SECRET_KEY ? 'Set' : 'Missing',
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
        ? 'Set'
        : 'Missing',
      NEXT_PUBLIC_CLERK_DOMAIN: env.NEXT_PUBLIC_CLERK_DOMAIN || 'Not Set',

      // Database
      DATABASE_URL: !!env.DATABASE_URL ? 'Set' : 'Missing',
      DIRECT_URL: !!env.DIRECT_URL ? 'Set' : 'Missing',

      // Other critical
      NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL || 'Not Set',
      NODE_ENV: env.NODE_ENV,
      VERCEL_ENVIRONMENT: env.VERCEL_ENVIRONMENT || 'Not Set',
    };

    // Check if using production Clerk keys
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
}
