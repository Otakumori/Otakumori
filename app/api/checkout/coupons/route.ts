/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { couponCode } = await req.json();

    // TODO: Implement coupon validation logic
    return NextResponse.json({
      ok: true,
      data: {
        valid: false,
        message: 'Coupon validation endpoint - implementation pending',
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
