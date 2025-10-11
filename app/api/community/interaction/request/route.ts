export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (!body?.targetId)
      return NextResponse.json({ ok: false, code: 'INVALID_INPUT' }, { status: 400 });
    if (body.targetId === 'blocked_demo') {
      return NextResponse.json(
        { ok: false, code: 'BLOCKED', message: 'Target has blocked you' },
        { status: 403 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error('Interaction request failed:', error.message, error.stack);
    return NextResponse.json({ ok: false, code: 'SERVER_ERROR' }, { status: 500 });
  }
}
