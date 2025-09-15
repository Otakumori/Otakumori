export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const after = url.searchParams.get('after') || '';
  if (!after || after === 'evt_0') {
    return NextResponse.json({
      ok: true,
      data: {
        cursor: 'evt_training_1',
        events: [
          {
            type: 'event',
            channel: 'training',
            eventId: 'evt_training_1',
            ts: Date.now(),
            payload: { npcId: 'maiden', emoteId: 'persistent_bow' },
          },
        ],
      },
    });
  }
  return NextResponse.json({ ok: true, data: { cursor: after, events: [] } });
}
