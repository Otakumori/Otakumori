import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  };

  // Check Inngest configuration
  diagnostics.inngest = {
    configured: {
      INNGEST_EVENT_KEY: !!env.INNGEST_EVENT_KEY,
      INNGEST_SIGNING_KEY: !!env.INNGEST_SIGNING_KEY,
      INNGEST_SERVE_URL: env.INNGEST_SERVE_URL || 'not set',
    },
    endpoint: '/api/inngest',
    status: 'checking...',
  };

  // Test Inngest endpoint
  try {
    const inngestUrl = `${env.VERCEL_URL ? `https://${env.VERCEL_URL}` : 'http://localhost:3000'}/api/inngest`;
    const res = await fetch(inngestUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    diagnostics.inngest.status = res.ok ? 'reachable' : `error: ${res.status}`;
    diagnostics.inngest.response = await res.text().catch(() => 'no body');
  } catch (error: any) {
    diagnostics.inngest.status = `unreachable: ${error.message}`;
  }

  // Check Printify configuration
  diagnostics.printify = {
    configured: {
      PRINTIFY_API_KEY: !!env.PRINTIFY_API_KEY,
      PRINTIFY_API_KEY_LENGTH: env.PRINTIFY_API_KEY?.length || 0,
      PRINTIFY_SHOP_ID: env.PRINTIFY_SHOP_ID || 'not set',
      PRINTIFY_API_URL: env.PRINTIFY_API_URL || 'not set',
      PRINTIFY_WEBHOOK_SECRET: !!env.PRINTIFY_WEBHOOK_SECRET,
    },
    status: 'checking...',
  };

  // Test Printify API
  try {
    const printifyUrl = `${env.PRINTIFY_API_URL}/shops/${env.PRINTIFY_SHOP_ID}/products.json?page=1&limit=1`;
    const res = await fetch(printifyUrl, {
      headers: {
        Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    diagnostics.printify.status = res.ok ? 'reachable' : `error: ${res.status} ${res.statusText}`;

    if (!res.ok) {
      diagnostics.printify.error = await res.text().catch(() => 'no error body');
    } else {
      const data = await res.json();
      diagnostics.printify.productsFound = data.data?.length || 0;
      diagnostics.printify.totalProducts = data.total || 0;
    }
  } catch (error: any) {
    diagnostics.printify.status = `unreachable: ${error.message}`;
  }

  // Check Clerk configuration
  diagnostics.clerk = {
    configured: {
      CLERK_SECRET_KEY: !!env.CLERK_SECRET_KEY,
      CLERK_ENCRYPTION_KEY: !!env.CLERK_ENCRYPTION_KEY,
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      NEXT_PUBLIC_CLERK_SIGN_IN_URL: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || 'not set',
    },
  };

  // Check Database
  diagnostics.database = {
    configured: {
      DATABASE_URL: !!env.DATABASE_URL,
      DIRECT_URL: !!env.DIRECT_URL,
    },
    status: 'Prisma client loaded',
  };

  // Check Redis
  diagnostics.redis = {
    configured: {
      UPSTASH_REDIS_REST_URL: !!env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: !!env.UPSTASH_REDIS_REST_TOKEN,
    },
  };

  // Check Stripe
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
}
