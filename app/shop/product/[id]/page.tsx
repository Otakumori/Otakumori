'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import NSFWAffirmNote from '@/components/NSFWAffirmNote';
import { t } from '@/lib/microcopy';
import { paths } from '@/lib/paths';

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

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

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
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An error occurred while fetching the product',
        );
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      void fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!selectedVariant || !product) return;

    try {
      // You can implement cart functionality here
      // Adding to cart
      // Example: await addToCart(product.id, quantity, selectedVariant.id);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="glass-card p-8">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-accent-pink border-t-transparent mx-auto"></div>
              <p className="text-secondary mt-4">Loading product...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center py-12">
            <div className="glass-card p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4 font-bold text-primary" aria-hidden="true">
                404
              </div>
              <h3 className="text-xl font-semibold text-primary mb-2">Product not found</h3>
              <p className="text-secondary mb-4">
                {error || 'The product you are looking for does not exist.'}
              </p>
              <Link href={paths.shop()} className="btn-primary inline-block">
                Back to Shop
              </Link>
            </div>
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
              <h1 className="text-3xl font-bold text-primary mb-2">{product.title}</h1>
              {product.category && <p className="text-accent-pink text-sm">{product.category}</p>}
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-accent-pink">
              {currency} {currentPrice.toFixed(2)}
            </div>

            {/* Description */}
            {product.description && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-primary mb-2">
                  {t('shop', 'description')}
                </h3>
                <p className="text-secondary leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Variants */}
            {product.variants && product.variants.length > 1 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-primary mb-3">{t('shop', 'options')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 rounded-lg border transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-accent-pink bg-accent-pink/20 text-primary'
                          : 'border-glass-border bg-glass-bg text-secondary hover:border-glass-border-hover'
                      }`}
                      disabled={!variant.is_enabled}
                    >
                      <div className="text-sm font-medium">{variant.title}</div>
                      <div className="text-xs opacity-60">
                        {product.currency || 'USD'} {variant.price.toFixed(2)}
                      </div>
                      {!variant.is_enabled && (
                        <div className="text-xs text-red-400">{t('shop', 'unavailable')}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="block text-sm font-medium text-primary mb-2">Quantity</p>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-glass-border bg-glass-bg text-primary hover:bg-glass-bg-hover transition-colors"
                >
                  -
                </button>
                <span className="w-16 text-center text-primary">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-glass-border bg-glass-bg text-primary hover:bg-glass-bg-hover transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariant?.is_enabled}
              className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedVariant?.is_enabled ? 'Add to Cart' : 'Unavailable'}
            </Button>

            {/* Back to Shop */}
            <div className="text-center">
              <Link
                href={paths.shop()}
                className="text-accent-pink hover:text-accent-pink/80 transition-colors"
              >
                ← Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
