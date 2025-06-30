import { NextResponse } from 'next/server';

export async function GET() {
  // Only show non-sensitive env vars for safety
  const safeEnv = Object.fromEntries(
    Object.entries(process.env).filter(
      ([k]) => !k.match(/SECRET|PASSWORD|TOKEN|KEY|PRIVATE|SESSION|COOKIE|AUTH/i) // hide sensitive
    )
  );
  return NextResponse.json({
    NODE_ENV: process.env.NODE_ENV,
    ...safeEnv,
    // Show all env keys for debugging
    ALL_ENV_KEYS: Object.keys(process.env),
  });
}
