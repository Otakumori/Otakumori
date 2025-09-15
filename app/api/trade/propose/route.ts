export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(_req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ ok: false, code: 'UNAUTHENTICATED' }, { status: 401 });
    return NextResponse.json({
      ok: false,
      code: 'DISABLED',
      message: 'Peer trade is disabled in this environment.',
    });
  } catch (err) {
    console.error('trade/propose error', err);
    return NextResponse.json({ ok: false, code: 'SERVER_ERROR' }, { status: 500 });
  }
}
