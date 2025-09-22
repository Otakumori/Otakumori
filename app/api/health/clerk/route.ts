// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function GET() {
  const ok = !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && !!env.CLERK_SECRET_KEY;
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 });
}
