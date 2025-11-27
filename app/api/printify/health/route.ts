
import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export const revalidate = 300; // 5 min

export async function GET() {
  const ok = !!env.PRINTIFY_API_KEY && !!env.PRINTIFY_SHOP_ID;
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}
