import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

function isInngestConfigured() {
  return Boolean(env.INNGEST_EVENT_KEY && env.INNGEST_SIGNING_KEY);
}

export async function GET() {
  const healthy = isInngestConfigured();

  return NextResponse.json(
    {
      ok: healthy,
      service: 'inngest',
      status: healthy ? 'configured' : 'unavailable',
    },
    { status: healthy ? 200 : 503 },
  );
}
