'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { stripHtml } from '@/lib/html';

type CatalogVariant = CatalogProduct['variants'][number];

function cleanText(raw: string) {
  return stripHtml(raw || '')
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&rsquo;|&lsquo;/g, "'")
    .replace(/&times;/g, 'x')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function getPrice(product: CatalogProduct, variant: CatalogVariant | null) {
  const cents = variant?.priceCents ?? product.priceRange?.min ?? product.priceCents ?? null;
  if (typeof cents === 'number') return cents / 100;
  return typeof product.price === 'number' ? product.price : 0;
}

export default function ProofProviderProductDetailClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<CatalogVariant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/catalog-product/${encodeURIComponent(productId)}`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        });
        const payload = await response.json();

        if (!response.ok || !payload?.ok || !payload?.data) {
          throw new Error(payload?.error?.message || payload?.message || `Detail request failed with ${response.status}`);
        }

        if (!cancelled) {
          const loaded = payload.data as CatalogProduct;
          setProduct(loaded);
          setSelectedVariant(loaded.variants?.find((variant) => variant.isEnabled && variant.inStock) ?? loaded.variants?.[0] ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load product');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const description = useMemo(() => cleanText(product?.description || ''), [product?.description]);

  if (loading) {
    return <div className="text-zinc-300">Loading product proof page...</div>;
  }

  if (error || !product) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">
        <h1 className="text-2xl font-semibold mb-2">Proof detail page failed</h1>
        <p>{error || 'Unknown error'}</p>
        <Link href="/shop-proof" className="mt-4 inline-flex rounded-xl bg-white/10 px-4 py-2 text-white">Back to proof shop</Link>
      </div>
    );
  }

  const image = product.image ?? product.images?.[0] ?? '';
  const price = getPrice(product, selectedVariant);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <Image src={image} alt={product.title} fill className="object-cover" unoptimized />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-3 inline-flex rounded-lg bg-black/60 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white">{product.provider}</div>
          <h1 className="text-4xl font-bold text-pink-200">{product.title}</h1>
          <p className="mt-3 text-3xl font-semibold text-pink-300">${price.toFixed(2)}</p>
        </div>

        <p className="text-zinc-300 leading-7">{description || 'No description available.'}</p>

        {product.variants?.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label htmlFor="proof-variant" className="mb-2 block text-sm font-medium text-pink-200">Variant</label>
            <select
              id="proof-variant"
              value={selectedVariant?.id || ''}
              onChange={(e) => {
                const nextVariant = product.variants.find((variant) => variant.id === e.target.value) ?? null;
                setSelectedVariant(nextVariant);
              }}
              className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white"
            >
              {product.variants.map((variant) => {
                const variantPrice = getPrice(product, variant);
                return (
                  <option key={variant.id} value={variant.id}>
                    {(variant.title ?? variant.sku ?? 'Default variant')} - ${variantPrice.toFixed(2)}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-zinc-300">
          <p><span className="font-medium text-pink-200">Product ID:</span> {product.id}</p>
          <p><span className="font-medium text-pink-200">SKU:</span> {selectedVariant?.sku || 'N/A'}</p>
          <p><span className="font-medium text-pink-200">Category:</span> {product.category || 'N/A'}</p>
        </div>

        <Link href="/shop-proof" className="inline-flex items-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white">Back to proof shop</Link>
      </div>
    </div>
  );
}
