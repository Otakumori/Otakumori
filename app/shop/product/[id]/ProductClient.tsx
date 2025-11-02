'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import NSFWAffirmNote from '@/components/NSFWAffirmNote';
import { t } from '@/lib/microcopy';
import { paths } from '@/lib/paths';
import { ShareButtons } from '@/app/components/shop/ShareButtons';
import { useRecentlyViewed } from '@/app/hooks/useRecentlyViewed';
import { useToastContext } from '@/app/contexts/ToastContext';
import { ProductSoapstoneWall } from '@/app/components/shop/ProductSoapstoneWall';

interface ProductVariant {
  id: string;
  title: string;
  price: number;
  is_enabled: boolean;
  is_default: boolean;
  sku: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  currency: string;
  isNSFW?: boolean;
  variants?: ProductVariant[];
  category?: string;
  tags?: string[];
}

export default function ProductClient({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
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
        const p = json?.data;
        if (!p) {
          setError('Product not found');
          return;
        }
        const shaped: Product = {
          id: p.id,
          title: p.title,
          description: p.description,
          image_url: p.images?.[0],
          price: p.price,
          currency: 'USD',
          variants: (p.variants ?? []).map((v: any) => ({
            id: v.id,
            title: String(v.printifyVariantId ?? 'Variant'),
            price: (v.priceCents ?? 0) / 100,
            is_enabled: v.isEnabled,
            is_default: false,
            sku: String(v.printifyVariantId ?? v.id),
          })),
        };
        setProduct(shaped);
        if (shaped.variants && shaped.variants.length > 0) {
          setSelectedVariant(shaped.variants[0]);
        }

        // Add to recently viewed
        addProduct({
          id: shaped.id,
          title: shaped.title,
          image: shaped.image_url,
          price: shaped.price,
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
  }, [productId, addProduct]);

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

  const imageUrl = product.image_url || '/images/products/placeholder.svg';
  const currentPrice = selectedVariant?.price || product.price;
  const currency = product.currency || 'USD';

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
        {product.isNSFW && <NSFWAffirmNote />}

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
              <p className="text-zinc-300 text-lg leading-relaxed">{product.description}</p>
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
                      disabled={!variant.is_enabled}
                      className="bg-purple-900"
                    >
                      {variant.title} - ${variant.price.toFixed(2)}
                      {!variant.is_enabled ? ' (Out of Stock)' : ''}
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
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.is_enabled}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Cart
            </button>

            {/* Product Details */}
            <div className="glass-panel rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-semibold text-pink-200 mb-4">Product Details</h3>
              <div className="space-y-2 text-sm text-zinc-300">
                <p>
                  <span className="font-medium">SKU:</span> {selectedVariant?.sku || product.id}
                </p>
                {product.category && (
                  <p>
                    <span className="font-medium">Category:</span> {product.category}
                  </p>
                )}
                <p>
                  <span className="font-medium">Availability:</span>{' '}
                  {selectedVariant?.is_enabled ? 'In Stock' : 'Out of Stock'}
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



