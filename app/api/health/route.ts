/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { auth } from '@clerk/nextjs/server';
import { env } from '@/env.mjs';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET() {
  const ok = !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!env.CLERK_SECRET_KEY;
  const { userId } = auth(); // will be null for anonymous

  return Response.json({
    clerk: ok ? 'ok' : 'missing env',
    userId: userId ?? null,
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV || 'development',
  });
}
