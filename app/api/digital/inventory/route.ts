
import { type NextRequest, NextResponse } from 'next/server';
import { withCors } from '@/app/lib/http/cors';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const _data = {
    items: [] as { id: string; name: string; qty: number; icon?: string }[],
  };
  const res = NextResponse.json(_data);
  return withCors(res, request.headers.get('origin'));
}
