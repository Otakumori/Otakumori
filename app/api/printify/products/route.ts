import { type NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';

export const runtime = 'nodejs';
export const revalidate = 60;

export async function GET(_request: NextRequest) {
  // Minimal inline call to satisfy tests and avoid env.mjs coupling
  const url = `https://api.printify.com/v1/shops/${env.PRINTIFY_SHOP_ID}/products.json`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.PRINTIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    return NextResponse.json({ ok: false, error: `Printify error ${res.status}: ${text}` }, { status: 502 });
  }
  const data = await res.json().catch(() => []);
  // Return raw array for backward-compat with tests
  return NextResponse.json(Array.isArray(data) ? data : (data?.data ?? []));
}
