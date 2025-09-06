// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { rotationWeekly } from '@/data/items.config';

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET() {
  try {
    return NextResponse.json({
      ok: true,
      data: { items: rotationWeekly },
    });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
