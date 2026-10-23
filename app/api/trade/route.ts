import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function unavailable() {
  return NextResponse.json(
    {
      ok: false,
      error: 'TRADING_NOT_AVAILABLE',
      message: 'Player-to-player trading is not available.',
    },
    { status: 503 },
  );
}

export const GET = unavailable;
export const POST = unavailable;
