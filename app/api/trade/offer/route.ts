import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'TRADING_NOT_AVAILABLE',
      message: 'Player-to-player trade offers are not available.',
    },
    { status: 503 },
  );
}
