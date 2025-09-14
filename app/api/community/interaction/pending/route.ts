export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const after = url.searchParams.get('after') || '';
  if (!after || after === 'evt_0') {
    return NextResponse.json({ ok: true, data: { cursor: 'evt_interact_1', events: [{ type: 'event', channel: 'interact', eventId: 'evt_interact_1', ts: Date.now(), payload: { requestId: 'req_demo' } }] } });
  }
  return NextResponse.json({ ok: true, data: { cursor: after, events: [] } });
}
