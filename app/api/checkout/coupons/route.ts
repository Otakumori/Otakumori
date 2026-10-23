import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: 'ENDPOINT_RETIRED',
      message: 'Coupon eligibility is calculated by the canonical checkout flow.',
      canonical: '/api/coupons/preview',
    },
    { status: 410 },
  );
}
