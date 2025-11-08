// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { APP_URLS } from '@/constants.server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const _data = {
    items: [] as { id: string; name: string; qty: number; icon?: string }[],
  };
  const res = NextResponse.json(_data);
  // Allow same-origin by default; if public origin is set, use it, else fallback to '*'
  res.headers.set('Access-Control-Allow-Origin', APP_URLS.site || '*');
  return res;
}

