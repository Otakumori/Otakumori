'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import NSFWAffirmNote from '@/components/NSFWAffirmNote';
import { t } from '@/lib/microcopy';
import { paths } from '@/lib/paths';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { ShareButtons } from '@/app/components/shop/ShareButtons';
import { useRecentlyViewed } from '@/app/hooks/useRecentlyViewed';
import { useToastContext } from '@/app/contexts/ToastContext';
import { ProductSoapstoneWall } from '@/app/components/shop/ProductSoapstoneWall';
import { HeaderButton } from '@/components/ui/header-button';
import { removeHtmlTables, stripHtml } from '@/lib/html';

type CatalogVariant = CatalogProduct['variants'][number];

function formatProductDescription(description: string | null | undefined): string[] {
  if (!description) return [];
  const withoutTables = removeHtmlTables(description);
  const normalized = withoutTables
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li)>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ul>/gi, '\n');
  const text = stripHtml(normalized);
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function ProductClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<CatalogProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<CatalogVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addProduct } = useRecentlyViewed();
  const { success, error: showError } = useToastContext();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/products/${productId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }
        const json = await response.json();
        const catalogProduct = json?.data as CatalogProduct | undefined;
        if (!catalogProduct) {
          setError('Product not found');
          return;
        }

        const normalizeImageValue = (value: unknown): string | null => {
          if (!value) return null;
          if (typeof value === 'string') return value;
          if (typeof value === 'object' && value !== null && 'src' in (value as Record<string, unknown>)) {
            const src = (value as Record<string, unknown>).src;
            return typeof src === 'string' ? src : null;
          }
          return null;
        };

        const normalizedImages = (catalogProduct.images ?? [])
          .map((entry) => normalizeImageValue(entry))
          .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);

        const normalizedProduct: CatalogProduct = {
          ...catalogProduct,
          image: normalizeImageValue(catalogProduct.image) ?? normalizedImages[0] ?? null,
          images: normalizedImages,
        };

        setProduct(normalizedProduct);

        const defaultVariant = catalogProduct.variants.find((variant) => variant.isEnabled && variant.inStock);
        setSelectedVariant(defaultVariant ?? catalogProduct.variants[0] ?? null);

        const displayPrice =
          catalogProduct.price ??
          (catalogProduct.priceRange.min != null
            ? Math.round(catalogProduct.priceRange.min) / 100
            : 0);

        const normalizedPriceCents =
          catalogProduct.priceCents ??
          (displayPrice != null ? Math.round(displayPrice * 100) : 0);

        addProduct({
          id: catalogProduct.id,
          title: catalogProduct.title,
          image: normalizedProduct.image ?? normalizedProduct.images[0] ?? '/assets/placeholder-product.jpg',
          priceCents: normalizedPriceCents,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred while fetching the product',
        );
        console.error('Error fetching product:', err);
        showError('Failed to fetch product details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      void fetchProduct();
    }
  }, [productId, addProduct, showError]);

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    success(`Added ${product?.title} to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent" />
          <p className="mt-4 text-pink-200">Loading treasure...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center glass-panel rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-pink-200 mb-4">Product Not Found</h1>
            <p className="text-zinc-300 mb-6">{error || 'This treasure has gone missing.'}</p>
            <Link href={paths.shop()}>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                Return to Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = product.image ?? product.images?.[0] ?? '/images/products/placeholder.svg';
  const currentPriceCents =
    selectedVariant?.priceCents ??
    (product.priceRange.min != null ? Math.round(product.priceRange.min) : product.priceCents ?? null);
  const currentPrice =
    currentPriceCents != null ? currentPriceCents / 100 : product.price ?? 0;
  const currency = 'USD';
  const isNSFW = product.tags.some((tag) => tag.toLowerCase().includes('nsfw'));

  const descriptionParagraphs = useMemo(
    () => formatProductDescription(product.description),
    [product.description],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-muted">
            <li>
              <Link href={paths.shop()} className="hover:text-primary transition-colors">
                {t('nav', 'shop')}
              </Link>
            </li>
            <li>/</li>
            <li className="text-primary">{product.title}</li>
          </ol>
        </nav>

        {/* NSFW Affirmation Note */}
        {isNSFW && <NSFWAffirmNote />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl glass-card">
              <Image src={imageUrl} alt={product.title} fill className="object-cover" priority />
            </div>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent-pink/20 text-sm text-accent-pink rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-pink-200 mb-4">{product.title}</h1>
              <div className="flex items-center gap-4 mb-6">
                <p className="text-3xl font-bold text-pink-400">
                  {currency === 'USD' ? '$' : currency}
                  {currentPrice.toFixed(2)}
                </p>
                <ShareButtons productTitle={product.title} productId={product.id} />
              </div>
              <div className="space-y-4 text-zinc-300 text-lg leading-relaxed">
                {descriptionParagraphs.length > 0
                  ? descriptionParagraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                  : <p>Premium quality print-on-demand merchandise.</p>}
              </div>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="glass-panel rounded-xl p-4">
                <label
                  htmlFor="variant-select"
                  className="block text-sm font-medium text-pink-200 mb-2"
                >
                  Select Variant
                </label>
                <select
                  id="variant-select"
                  value={selectedVariant?.id || ''}
                  onChange={(e) => {
                    const variant = product.variants?.find((v) => v.id === e.target.value);
                    if (variant) setSelectedVariant(variant);
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
                >
                  {product.variants.map((variant) => (
                    <option
                      key={variant.id}
                      value={variant.id}
                      disabled={!variant.isEnabled}
                      className="bg-purple-900"
                    >
                      {variant.title ?? `Variant ${variant.printifyVariantId}`} - $
                      {((variant.priceCents ?? Math.round((variant.price ?? 0) * 100)) / 100).toFixed(2)}
                      {!variant.isEnabled ? ' (Out of Stock)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Quantity */}
            <div className="glass-panel rounded-xl p-4">
              <label htmlFor="quantity" className="block text-sm font-medium text-pink-200 mb-2">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max="99"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white"
              />
            </div>

            {/* Add to Cart */}
            <HeaderButton
              onClick={handleAddToCart}
              disabled={!selectedVariant || !selectedVariant.isEnabled}
              className="w-full justify-center py-4 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
            >
              Add to Cart
            </HeaderButton>

            {/* Product Details */}
            <div className="glass-panel rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-pink-200 mb-4">Product Details</h3>
              <div className="space-y-2 text-sm text-zinc-300">
                <p>
                  <span className="font-medium">SKU:</span> {selectedVariant?.sku || selectedVariant?.printifyVariantId || 'N/A'}
                </p>
                {product.category && (
                  <p>
                    <span className="font-medium">Category:</span> {product.category}
                  </p>
                )}
                <p>
                  <span className="font-medium">Availability:</span>{' '}
                  {selectedVariant?.isEnabled ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Soapstone Messages from fellow travelers */}
        <div className="mt-12">
          <ProductSoapstoneWall productId={product.id} />
        </div>
      </div>
    </div>
  );
}
