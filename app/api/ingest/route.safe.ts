import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { env } from '@/env';

const HOST = (env as any).NEXT_PUBLIC_POSTHOG_HOST || 'https://us.posthog.com';

export async function POST(req: NextRequest) {
  const url = `${HOST}/capture/`;
  const body = await req.text(); // forward raw
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    // Do not forward cookies
  });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { 'content-type': r.headers.get('content-type') ?? 'application/json' },
  });
}

// Optional GET passthrough for /decide or health checks:
export async function GET() {
  return NextResponse.json({ ok: true });
}
