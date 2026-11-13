import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'ENDPOINT_RETIRED',
      message: 'Use the persisted cosmetics equip endpoint.',
      canonical: '/api/v1/cosmetics/equip',
    },
    { status: 410 },
  );
}
