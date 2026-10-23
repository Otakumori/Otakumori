import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'NEWSLETTER_NOT_AVAILABLE',
      message: 'Newsletter subscriptions are not available yet.',
    },
    { status: 503 },
  );
}
