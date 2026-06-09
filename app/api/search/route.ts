
import { NextResponse } from 'next/server';

function uniq<T>(arr: T[], key: (x: T) => string) {
  const m = new Set<string>();
  return arr.filter((x) => {
    const k = key(x);
    if (m.has(k)) return false;
    m.add(k);
    return true;
  });
}

type CatalogProduct = {
  id: string;
  title: string;
  image?: string | null;
  tags?: string[];
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toLowerCase().trim();

  if (!q) return NextResponse.json({ suggestions: [] });

  // Public autocomplete must not call locked provider/diagnostic routes.
  const catalogUrl = new URL('/api/v1/products', req.url);
  catalogUrl.searchParams.set('q', q);
  catalogUrl.searchParams.set('limit', '20');

  const r = await fetch(catalogUrl, { cache: 'no-store' }).catch(() => null);
  const payload = (await r?.json().catch(() => null)) as
    | { ok?: boolean; data?: { products?: CatalogProduct[] } }
    | null;
  const products = payload?.ok ? payload.data?.products ?? [] : [];

  const hits = products
    .flatMap((p) => [
      { t: p.title, i: p.image, id: p.id },
      ...(p.tags || []).map((t: string) => ({ t, id: p.id, i: p.image })),
    ])
    .filter((x) => String(x.t).toLowerCase().includes(q))
    .slice(0, 8);

  return NextResponse.json({
    suggestions: uniq(hits, (x: any) => `${x.t}-${x.id}`).slice(0, 8),
  });
}
