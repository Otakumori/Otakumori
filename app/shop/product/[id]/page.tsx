// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/app/components/ui/card';
import Link from 'next/link';
import NSFWAffirmNote from '@/components/NSFWAffirmNote';
import { t } from '@/lib/microcopy';

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
      console.log('Adding to cart:', {
        productId: product.id,
        variantId: selectedVariant.id,
        quantity,
        price: selectedVariant.price,
      });
      // Example: await addToCart(product.id, quantity, selectedVariant.id);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold mb-2">Product not found</h3>
          <p className="text-white/60 mb-4">
            {error || 'The product you are looking for does not exist.'}
          </p>
          <Link
            href="/shop"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const imageUrl = product.image_url || '/images/products/placeholder.svg';
  const currentPrice = selectedVariant?.price || product.price;
  const currency = product.currency || 'USD';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-white/60">
          <li>
            <Link href="/shop" className="hover:text-white">
              {t('nav', 'shop')}
            </Link>
          </li>
          <li>/</li>
          <li className="text-white">{product.title}</li>
        </ol>
      </nav>

      {/* NSFW Affirmation Note */}
      {product.isNSFW && <NSFWAffirmNote />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-white/20">
            <Image src={imageUrl} alt={product.title} fill className="object-cover" priority />
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-pink-500/20 text-sm text-pink-200 rounded-full"
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
            <h1 className="text-3xl font-bold text-white mb-2">{product.title}</h1>
            {product.category && <p className="text-pink-400 text-sm">{product.category}</p>}
          </div>

          {/* Price */}
          <div className="text-3xl font-bold text-pink-400">
            {currency} {currentPrice.toFixed(2)}
          </div>

          {/* Description */}
          {product.description && (
            <Card className="p-6 bg-white/5 border-white/10">
              <h3 className="text-lg font-semibold text-white mb-2">{t('shop', 'description')}</h3>
              <p className="text-white/80 leading-relaxed">{product.description}</p>
            </Card>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 1 && (
            <Card className="p-6 bg-white/5 border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">{t('shop', 'options')}</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3 rounded-lg border transition-colors ${
                      selectedVariant?.id === variant.id
                        ? 'border-pink-500 bg-pink-500/20 text-white'
                        : 'border-white/20 bg-white/10 text-white/80 hover:border-white/40'
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
            </Card>
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Quantity</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                -
              </button>
              <span className="w-16 text-center text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={!selectedVariant?.is_enabled}
            className="w-full bg-pink-600 hover:bg-pink-700 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedVariant?.is_enabled ? 'Add to Cart' : 'Unavailable'}
          </Button>

          {/* Back to Shop */}
          <div className="text-center">
            <Link href="/shop" className="text-pink-400 hover:text-pink-300 transition-colors">
              ← Back to Shop
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
