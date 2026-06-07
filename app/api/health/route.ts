import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { prisma } from '@/server/db';

export const runtime = 'nodejs';

/**
 * Public liveness endpoint.
 *
 * Intentionally minimal: returns only `{ ok, status }` (plus a timestamp) so
 * it cannot be used for reconnaissance. The detailed env-presence and
 * provider-configuration map previously returned here leaked which secrets and
 * providers were configured; that information now lives behind admin-only
 * diagnostics (see `app/api/_health`, `app/api/health/comprehensive`).
 *
 * `ok` still reflects real database connectivity and required-config presence
 * so uptime checks (and CI) can rely on it, but the granular breakdown is not
 * exposed to unauthenticated callers.
 */

const REQUIRED_CONFIG = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

async function databaseHealthy(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const requiredConfigPresent = REQUIRED_CONFIG.every((name) => hasValue(env[name]));
  const dbHealthy = await databaseHealthy();
  const ok = requiredConfigPresent && dbHealthy;
  const status = ok ? 'healthy' : 'unhealthy';

  const strictStatus = new URL(request.url).searchParams.get('strict') === '1';

  return NextResponse.json(
    { ok, status },
    {
      status: strictStatus && !ok ? 503 : 200,
      headers: { 'Cache-Control': 'no-store' },
    },
  );
}
