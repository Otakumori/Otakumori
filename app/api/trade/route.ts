
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { log } from '@/lib/logger';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET(req: NextRequest) {
  try {
    // Log trade list request
    console.warn('Trade list requested from:', req.headers.get('user-agent'));

    // TODO: fetch trades from database
    const trades: any[] = [];
    return NextResponse.json({ ok: true, trades });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    log('trade_list_error', { message: error.message });
    return NextResponse.json({ ok: false, trades: [] }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { itemId, targetUserId, message } = await req.json();
    // TODO: create trade in database
    log('trade_created', { userId, itemId, targetUserId, message: message || '(no message)' });
    return NextResponse.json({ ok: true, message: 'Trade offer sent' });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    log('trade_create_error', { message: error.message });
    return NextResponse.json({ ok: false, error: 'Failed to create trade' }, { status: 400 });
  }
}
