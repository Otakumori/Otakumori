import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

export async function GET() {
  try {
    const key = env.PRINTIFY_API_KEY,
      store = env.PRINTIFY_SHOP_ID;
    if (!key || !store)
      return NextResponse.json({ products: [], source: 'missing-env' }, { status: 500 });

    const r = await fetch(`https://api.printify.com/v1/shops/${store}/products.json`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });

    if (!r.ok)
      return NextResponse.json(
        { error: 'printify-failed', detail: await r.text() },
        { status: 502 },
      );

    const raw = await r.json();
    const products = (raw?.data || raw || []).map((p: any) => ({
      id: p.id,
      title: p.title,
      image: p.images?.[0]?.src ?? null,
      tags: p.tags ?? [],
      options: p.options ?? [],
      variants: (p.variants || []).filter((v: any) => v.is_enabled && v.is_available),
    }));

    const res = NextResponse.json({ products, source: 'live' });
    res.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    return res;
  } catch (e: any) {
    return NextResponse.json({ error: 'unexpected', detail: e?.message }, { status: 500 });
  }
}
