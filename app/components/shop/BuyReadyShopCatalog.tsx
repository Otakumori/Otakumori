'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { getSellableCatalogItems, type SellableCatalogItem } from '@/lib/catalog/sellable';
import { stripHtml } from '@/lib/html';
import { paths } from '@/lib/paths';

interface ApiResponse {
  ok?: boolean;
  data?: {
    products?: CatalogProduct[];
  };
  products?: CatalogProduct[];
}

function getStartingPriceLabel(product: CatalogProduct) {
  const min = product.priceRange?.min ?? product.priceCents ?? null;
  if (typeof min === 'number') return `$${(min / 100).toFixed(2)}`;
  if (typeof product.price === 'number') return `$${product.price.toFixed(2)}`;
  return 'Price unavailable';
}

function normalizeTitle(title: string) {
  return title.toLowerCase().replace(/&[a-z]+;/g, ' ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function cleanSummary(raw: string) {
  return stripHtml(raw || '')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&times;/g, 'x')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\b(xs|s|m|l|xl|2xl|3xl|4xl)\b(\s+\b(xs|s|m|l|xl|2xl|3xl|4xl)\b)+/gi, ' ')
    .replace(/\b(length|width|height|size guide|sizes?)\b[\s\S]*$/i, ' ')
    .replace(/\bpadding:\s*\d+/gi, ' ')
    .replace(/\bcolor:\s*#[0-9a-f]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 170);
}

function dedupeProducts(products: CatalogProduct[]) {
  const seen = new Set<string>();
  const deduped: CatalogProduct[] = [];
  for (const product of products) {
    const key = [product.provider ?? 'prisma', normalizeTitle(product.title)].join('::');
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(product);
  }
  return deduped;
}

export default function BuyReadyShopCatalog() {
  const [products, setProducts] = useState<SellableCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/v1/catalog?limit=48', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error(`Catalog request failed with ${response.status}`);
        const payload = (await response.json()) as ApiResponse;
        const loaded = payload.data?.products ?? payload.products ?? [];
        if (!cancelled) setProducts(getSellableCatalogItems(dedupeProducts(loaded)));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load buy-ready products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleProducts = useMemo(() => products.slice(0, 24), [products]);

  if (loading) return <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-pink-50/70">Loading buy-ready storefront...</div>;
  if (error) return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-red-100"><h2 className="text-xl font-semibold mb-2">Unable to load storefront</h2><p>{error}</p></div>;
  if (visibleProducts.length === 0) {
    return (
      <div className="rounded-lg border border-pink-200/20 bg-white/5 p-8 text-center text-pink-100 shadow-2xl shadow-black/30">
        <h2 className="text-2xl font-semibold">No buy-ready products yet</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-pink-100/70">
          The public shop is only showing products with images, prices, and in-stock variants right now. Sync or enable products in admin, then refresh this page.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {visibleProducts.map((product) => {
        const image = product.image;
        const summary = cleanSummary(product.description || '');
        const hasMultipleOptions = Boolean(product.variants?.length && product.variants.length > 1);
        const productHref = paths.product(product.id);
        return (
          <article key={product.id} className="group overflow-hidden rounded-lg border border-white/10 bg-black/30 shadow-2xl shadow-black/20 backdrop-blur-md transition duration-200 hover:-translate-y-1 hover:border-pink-200/40">
            <Link href={productHref} className="block">
              <div className="relative aspect-[4/5] bg-black/20">
                <Image src={image} alt={product.title} fill className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {product.provider ? <div className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-white">{product.provider}</div> : null}
              </div>
            </Link>
            <div className="space-y-3 p-5">
              <div>
                <Link href={productHref} className="block">
                  <h2 className="line-clamp-2 text-lg font-semibold text-white transition-colors hover:text-pink-200">{product.title}</h2>
                </Link>
                <div className="mt-1">
                  {hasMultipleOptions ? <p className="text-xs uppercase tracking-[0.18em] text-zinc-400">Starting at</p> : null}
                  <p className="font-medium text-pink-200">{getStartingPriceLabel(product)}</p>
                </div>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-zinc-300">{summary || 'No description available.'}</p>
              <Link href={productHref} className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-pink-200/20 bg-pink-500/70 px-4 text-sm font-medium text-white transition-colors hover:bg-pink-500">Choose options</Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
