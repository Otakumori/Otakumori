
import { NextResponse } from 'next/server';
export async function POST(_request: Request) {
  return NextResponse.json(
    {
      ok: false,
      error: 'Direct shop fulfillment is disabled. Complete payment through canonical checkout.',
      canonicalPath: '/api/v1/checkout/session',
    },
    { status: 410 },
  );
}
