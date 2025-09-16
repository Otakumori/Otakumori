// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function GET() {
  // Only show non-sensitive env vars for safety
  const safeEnv = Object.fromEntries(
    Object.entries(env).filter(
      ([k]) => !k.match(/SECRET|PASSWORD|TOKEN|KEY|PRIVATE|SESSION|COOKIE|AUTH/i), // hide sensitive
    ),
  );
  return NextResponse.json({
    NODE_ENV: env.NODE_ENV,
    ...safeEnv,
    // Show all env keys for debugging
    ALL_ENV_KEYS: Object.keys(env),
  });
}
