// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { printify } from '@/lib/printifyClient';

const mask = (s?: string) => (s ? s.slice(0, 4) + '********' + s.slice(-4) : null);

export async function GET() {
  try {
    const res = await printify.get('/shops.json');
    const count = Array.isArray(res.data) ? res.data.length : undefined;
    return NextResponse.json({ ok: true, shops: count });
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        status: e?.response?.status,
        data: e?.response?.data,
        tokenMasked: mask(process.env.PRINTIFY_API_KEY),
      },
      { status: 500 },
    );
  }
}
