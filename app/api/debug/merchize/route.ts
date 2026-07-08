import { type NextRequest, NextResponse } from 'next/server';
import { createApiSuccess, generateRequestId } from '@/app/lib/api-contracts';
import { withAdminAuth } from '@/app/lib/auth/admin';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';

export const GET = withAdminAuth(async (_request: NextRequest) => {
  const requestId = generateRequestId();

  return NextResponse.json(
    createApiSuccess(
      {
        configured: {
          MERCHIZE_API_URL: Boolean(env.MERCHIZE_API_URL),
          MERCHIZE_STORE_API_URL: Boolean(env.MERCHIZE_STORE_API_URL),
          MERCHIZE_ACCESS_TOKEN: Boolean(env.MERCHIZE_ACCESS_TOKEN),
          MERCHIZE_API_TOKEN: Boolean(env.MERCHIZE_API_TOKEN),
          MERCHIZE_WEBHOOK_SECRET: Boolean(env.MERCHIZE_WEBHOOK_SECRET),
        },
      },
      requestId,
    ),
    { headers: { 'Cache-Control': 'no-store' } },
  );
});
