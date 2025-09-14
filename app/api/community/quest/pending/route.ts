export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const after = url.searchParams.get('after') || '';
  return NextResponse.json({ ok: true, data: { cursor: after || 'evt_0', events: [] } });
}

