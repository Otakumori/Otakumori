'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { ProductGrid } from './StorefrontProductCard';
import { StorefrontPanel } from './StorefrontPrimitives';

interface ApiResponse {
  ok?: boolean;
  data?: {
    products?: CatalogProduct[];
  };
  products?: CatalogProduct[];
}

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isBuyReadyProduct(product: CatalogProduct) {
  const hasPrice =
    typeof product.price === 'number' ||
    typeof product.priceCents === 'number' ||
    typeof product.priceRange?.min === 'number';
  const hasImage = Boolean((product.image ?? product.images?.[0] ?? '').trim());
  const hasAvailableVariant = Boolean(
    product.variants?.some((variant) => variant.isEnabled && variant.inStock),
  );
  return hasPrice && hasImage && hasAvailableVariant;
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
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/v1/catalog?limit=48', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`Catalog request failed with ${response.status}`);
        const payload = (await response.json()) as ApiResponse;
        const loaded = payload.data?.products ?? payload.products ?? [];
        if (!cancelled) setProducts(dedupeProducts(loaded.filter(isBuyReadyProduct)));
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load buy-ready products');
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
    return (
      <div
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        data-testid="product-grid"
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="min-h-[31rem] animate-pulse rounded-[1.8rem] border border-pink-100/10 bg-white/[0.045] p-3"
          >
            <div className="aspect-[4/5] rounded-[1.55rem] bg-white/[0.06]" />
            <div className="mt-5 space-y-3 px-2">
              <div className="h-5 w-3/4 rounded bg-white/[0.08]" />
              <div className="h-4 w-1/3 rounded bg-white/[0.08]" />
              <div className="h-16 rounded bg-white/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <StorefrontPanel className="p-8 text-red-100">
        <h2 className="font-display text-2xl font-semibold text-red-100">
          Unable to load storefront
        </h2>
        <p className="mt-3 text-sm leading-6 text-red-100/75">{error}</p>
      </StorefrontPanel>
    );
  }

  if (visibleProducts.length === 0) {
    return (
      <StorefrontPanel className="p-8 text-center text-pink-100" data-testid="product-grid">
        <h2 className="font-display text-2xl font-semibold">No buy-ready products yet</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-pink-100/70">
          The public shop is only showing products with images, prices, and in-stock variants right
          now. Sync or enable products in admin, then refresh this page.
        </p>
      </StorefrontPanel>
    );
  }

  return <ProductGrid products={visibleProducts} />;
}
