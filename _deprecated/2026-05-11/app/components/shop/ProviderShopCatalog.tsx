'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { stripHtml } from '@/lib/html';
import { paths } from '@/lib/paths';
import type { CatalogProduct } from '@/lib/catalog/serialize';

interface ApiResponse {
  ok?: boolean;
  data?: {
    products?: CatalogProduct[];
  };
  products?: CatalogProduct[];
}

function getPriceLabel(product: CatalogProduct) {
  const min = product.priceRange?.min ?? product.priceCents ?? null;
  const max = product.priceRange?.max ?? product.priceCents ?? null;
  if (min != null && max != null) {
    return min === max
      ? `$${(min / 100).toFixed(2)}`
      : `$${(min / 100).toFixed(2)} - $${(max / 100).toFixed(2)}`;
  }
  if (typeof product.price === 'number') return `$${product.price.toFixed(2)}`;
  return 'Price unavailable';
}

function isLiveProduct(product: CatalogProduct) {
  const hasProvider = product.provider === 'printify' || product.provider === 'merchize';
  const hasPrice = typeof product.price === 'number' || typeof product.priceCents === 'number' || typeof product.priceRange?.min === 'number';
  const hasImage = Boolean((product.image ?? product.images?.[0] ?? '').trim());
  return hasProvider && hasPrice && hasImage;
}

export default function ProviderShopCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/v1/catalog?limit=24', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Catalog request failed with ${response.status}`);
        }

        const payload = (await response.json()) as ApiResponse;
        const loaded = payload.data?.products ?? payload.products ?? [];

        if (!cancelled) {
          setProducts(loaded.filter(isLiveProduct));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load live products');
        }
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

  if (loading) {
    return <div className="text-zinc-300">Loading live products...</div>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
        <h2 className="text-xl font-semibold mb-2">Unable to load curated products</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (visibleProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-zinc-200">
        No provider-backed products are ready for display yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {visibleProducts.map((product) => {
        const image = product.image ?? product.images?.[0] ?? '';
        const summary = stripHtml(product.description || '').slice(0, 180);
        return (
          <article key={product.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-lg">
            <div className="relative aspect-[4/5] bg-black/20">
              <Image
                src={image}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                unoptimized
              />
              <div className="absolute right-3 top-3 rounded-lg bg-black/70 px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-white">
                {product.provider}
              </div>
            </div>
            <div className="space-y-3 p-5">
              <div>
                <h2 className="line-clamp-2 text-lg font-semibold text-white">{product.title}</h2>
                <p className="mt-1 text-pink-200 font-medium">{getPriceLabel(product)}</p>
              </div>
              <p className="line-clamp-3 text-sm leading-6 text-zinc-300">{summary || 'No description available.'}</p>
              <Link
                href={paths.product(product.id)}
                className="inline-flex items-center justify-center rounded-xl bg-pink-500/80 px-4 py-2 text-white transition-colors hover:bg-pink-500"
              >
                View Details
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
