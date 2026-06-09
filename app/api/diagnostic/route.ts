import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type DiagnosticStatus = 'configured' | 'missing' | 'reachable' | 'unreachable' | 'error';

export const GET = withAdminAuth(async (_request: NextRequest) => {
  const diagnostics: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  };

  diagnostics.inngest = {
    configured: {
      INNGEST_EVENT_KEY: !!env.INNGEST_EVENT_KEY,
      INNGEST_SIGNING_KEY: !!env.INNGEST_SIGNING_KEY,
      INNGEST_SERVE_URL: !!env.INNGEST_SERVE_URL,
    },
    endpoint: '/api/inngest',
    status: await checkInternalEndpoint('/api/inngest'),
  };

  diagnostics.printify = {
    configured: {
      PRINTIFY_API_KEY: !!env.PRINTIFY_API_KEY,
      PRINTIFY_SHOP_ID: !!env.PRINTIFY_SHOP_ID,
      PRINTIFY_API_URL: !!env.PRINTIFY_API_URL,
      PRINTIFY_WEBHOOK_SECRET: !!env.PRINTIFY_WEBHOOK_SECRET,
    },
    status: await checkPrintify(),
  };

  diagnostics.clerk = {
    configured: {
      CLERK_SECRET_KEY: !!env.CLERK_SECRET_KEY,
      CLERK_ENCRYPTION_KEY: !!env.CLERK_ENCRYPTION_KEY,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: !!env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    },
  };

  diagnostics.database = {
    configured: {
      DATABASE_URL: !!env.DATABASE_URL,
      DIRECT_URL: !!env.DIRECT_URL,
    },
    status: 'Prisma client loaded',
  };

  diagnostics.redis = {
    configured: {
      UPSTASH_REDIS_REST_URL: !!env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: !!env.UPSTASH_REDIS_REST_TOKEN,
    },
  };

  diagnostics.stripe = {
    configured: {
      STRIPE_SECRET_KEY: !!env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: !!env.STRIPE_WEBHOOK_SECRET,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    },
  };

  return NextResponse.json(diagnostics, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
});

async function checkInternalEndpoint(pathname: string): Promise<DiagnosticStatus> {
  try {
    const baseUrl = env.VERCEL_URL ? `https://${env.VERCEL_URL}` : 'http://localhost:3000';
    const res = await fetch(`${baseUrl}${pathname}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    return res.ok ? 'reachable' : 'error';
  } catch {
    return 'unreachable';
  }
}

async function checkPrintify(): Promise<DiagnosticStatus> {
  if (!env.PRINTIFY_API_KEY || !env.PRINTIFY_SHOP_ID || !env.PRINTIFY_API_URL) {
    return 'missing';
  }

  try {
    const printifyUrl = `${env.PRINTIFY_API_URL}/shops/${env.PRINTIFY_SHOP_ID}/products.json?page=1&limit=1`;
    const res = await fetch(printifyUrl, {
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    return res.ok ? 'reachable' : 'error';
  } catch {
    return 'unreachable';
  }
}
