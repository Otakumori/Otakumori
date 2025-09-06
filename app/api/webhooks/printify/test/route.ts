// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

export async function POST() {
  // Minimal fake payload to test handler pipeline
  const example = { type: 'order:created', data: { id: 'test_order_id' } };
  return NextResponse.json({ ok: true, example });
}
