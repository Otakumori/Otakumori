import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { withAdminAuth } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async () => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    services: {
      inngest: env.INNGEST_EVENT_KEY && env.INNGEST_SIGNING_KEY ? 'configured' : 'unavailable',
      printify: env.PRINTIFY_API_KEY && env.PRINTIFY_SHOP_ID ? 'configured' : 'unavailable',
      clerk: env.CLERK_SECRET_KEY ? 'configured' : 'unavailable',
      database: env.DATABASE_URL ? 'configured' : 'unavailable',
      redis:
        env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN ? 'configured' : 'unavailable',
      stripe: env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'unavailable',
    },
  };

  return NextResponse.json(diagnostics, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
});
