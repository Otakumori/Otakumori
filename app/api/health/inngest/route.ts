import { NextResponse } from 'next/server';
import { env } from '@/env';

const SERVE_URL = env.INNGEST_SERVE_URL || 'http://localhost:8288/api/inngest';

export async function GET() {
  const results: Record<string, any> = {
    serveUrl: SERVE_URL,
    env: {
      INNGEST_EVENT_KEY: Boolean(process.env.INNGEST_EVENT_KEY),
      INNGEST_SIGNING_KEY: Boolean(process.env.INNGEST_SIGNING_KEY),
    },
  };

  // 1) GET the serve endpoint (auth gating will show up as 401/403)
  try {
    const res = await fetch(SERVE_URL, { method: 'GET' });
    results.get = { status: res.status, ok: res.ok };
  } catch (err: any) {
    results.get = { error: err?.message || String(err) };
  }

  // 2) POST a harmless test event
  try {
    const res = await fetch(SERVE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'healthcheck/inngest',
        data: { ts: new Date().toISOString() },
      }),
    });
    const text = await res.text();
    results.post = { status: res.status, ok: res.ok, sample: text.slice(0, 200) };
  } catch (err: any) {
    results.post = { error: err?.message || String(err) };
  }

  const healthy =
    results.get?.ok === true &&
    typeof results.get?.status === 'number' &&
    results.get.status < 400 &&
    results.post?.ok === true;

  return NextResponse.json({ healthy, results }, { status: healthy ? 200 : 503 });
}
