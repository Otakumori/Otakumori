// DEPRECATED: This component is a duplicate. Use app\api\webhooks\stripe\route.ts instead.
import { NextResponse } from 'next/server';
import { env } from '@/env.mjs';

function uniq<T>(arr: T[], key: (x: T) => string) {
  const m = new Set<string>();
  return arr.filter((x) => {
    const k = key(x);
    if (m.has(k)) return false;
    m.add(k);
    return true;
  });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();

  if (!q) return NextResponse.json({ suggestions: [] });

  const r = await fetch(`${env.NEXT_PUBLIC_SITE_URL || ''}/api/printify/products`, {
    cache: 'no-store',
  }).catch(() => null);
  const data = (await r?.json().catch(() => ({ products: [] }))) || { products: [] };

  const hits = (data.products || [])
    .flatMap((p: any) => [
      { t: p.title, i: p.image, id: p.id },
      ...(p.tags || []).map((t: string) => ({ t, id: p.id, i: p.image })),
    ])
    .filter((x: any) => String(x.t).toLowerCase().includes(q))
    .slice(0, 8);

  return NextResponse.json({
    suggestions: uniq(hits, (x: any) => `${x.t}-${x.id}`).slice(0, 8),
  });
}
