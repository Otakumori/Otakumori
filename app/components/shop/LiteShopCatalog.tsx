'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { paths } from '@/lib/paths';
import type { CatalogProduct } from '@/lib/catalog/serialize';

interface ApiResponse {
  ok?: boolean;
  data?: {
    products?: CatalogProduct[];
  };
  products?: CatalogProduct[];
}

function priceLabel(product: CatalogProduct) {
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

export default function LiteShopCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/v1/catalog?limit=12', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Catalog request failed with ${response.status}`);
        }

        const payload = (await response.json()) as ApiResponse;
        const loaded = payload.data?.products ?? payload.products ?? [];

        if (!cancelled) {
          setProducts(
            loaded.filter((product) => {
              const image = product.image ?? product.images?.[0];
              return Boolean(image && image.trim() !== '');
            }),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="text-zinc-300">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
        <h2 className="text-xl font-semibold mb-2">Shop fallback hit an error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((product) => {
        const image = product.image ?? product.images?.[0] ?? '';
        return (
          <article key={product.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="relative aspect-square bg-black/20">
              <Image
                src={image}
                alt={product.title}
                fill
                sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-xs uppercase tracking-wide text-white">
                {product.provider ?? 'catalog'}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h2 className="text-lg font-semibold text-white line-clamp-2">{product.title}</h2>
                <p className="text-pink-200 font-medium">{priceLabel(product)}</p>
              </div>
              <p className="text-sm text-zinc-300 line-clamp-3">{product.description || 'No description available.'}</p>
              <Link
                href={paths.product(product.id)}
                className="inline-flex items-center justify-center rounded-xl bg-pink-500/80 px-4 py-2 text-white hover:bg-pink-500 transition-colors"
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
