import { NextResponse } from 'next/server';
import { PostHog } from 'posthog-node';
import { env } from '@/env';

export async function GET() {
  const key = (env as any).NEXT_PUBLIC_POSTHOG_KEY;
  if (!key)
    return NextResponse.json(
      { ok: false, error: 'Missing NEXT_PUBLIC_POSTHOG_KEY' },
      { status: 500 },
    );

  const host = (env as any).NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com';
  const ph = new PostHog(key, { host });
  ph.capture({
    distinctId: 'server-debug',
    event: 'debug_ping',
    properties: { where: 'server', ts: Date.now() },
  });
  await ph.shutdown();
  return NextResponse.json({ ok: true });
}
