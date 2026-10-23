import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function retired() {
  return NextResponse.json(
    {
      ok: false,
      error: 'ENDPOINT_RETIRED',
      message: 'Use the persisted profile API.',
      canonical: '/api/profile/me',
    },
    { status: 410 },
  );
}

export const GET = retired;
export const PUT = retired;
