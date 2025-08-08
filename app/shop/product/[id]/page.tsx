'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, ArrowLeft } from 'lucide-react';
import { useCart } from '@/lib/hooks/useCart';
import { useWishlist } from '@/lib/hooks/useWishlist';
import { useAchievements } from '@/lib/hooks/useAchievements';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  variants: {
    id: string;
    price: number;
    title: string;
  }[];
  tags: string[];
}

interface ProductParams {
  id: string;
}

export default function ProductPage() {
  const params = useParams();
  const productId = params?.id as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/shop/products/${productId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.product) {
          throw new Error('Product not found');
        }
        setProduct(data.product);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-pink-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-red-600">Error</h2>
          <p className="mb-6 text-gray-600">{error || 'Product not found'}</p>
          <Link
            href="/shop"
            className="inline-block rounded bg-pink-500 px-6 py-3 text-white transition-colors hover:bg-pink-600"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      ...product,
      selectedVariant: product.variants[selectedVariant],
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link
          href="/shop"
          className="mb-8 inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-square overflow-hidden rounded-lg bg-white shadow-lg"
            >
              <Image src={product.images[0]} alt={product.title} fill className="object-cover" />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {product.images.slice(1).map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative aspect-square overflow-hidden rounded-lg bg-white shadow"
                >
                  <Image
                    src={image}
                    alt={`${product.title} - Image ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
              <p className="mt-2 text-lg text-gray-600">{product.description}</p>
            </div>

            {/* Price */}
            <div className="text-2xl font-bold text-pink-500">
              ${(product.variants[selectedVariant].price / 100).toFixed(2)}
            </div>

            {/* Variants */}
            {product.variants.length > 1 && (
              <div>
                <h3 className="mb-2 font-medium text-gray-900">Select Variant</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(index)}
                      className={`rounded-lg px-4 py-2 ${
                        selectedVariant === index
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {variant.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="mb-2 font-medium text-gray-900">Quantity</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="rounded-lg bg-gray-100 px-3 py-1 hover:bg-gray-200"
                >
                  -
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="rounded-lg bg-gray-100 px-3 py-1 hover:bg-gray-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex flex-1 items-center justify-center space-x-2 rounded-lg bg-pink-500 px-6 py-3 text-white hover:bg-pink-600"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() =>
                  isInWishlist(product.id) ? removeFromWishlist(product.id) : addToWishlist(product)
                }
                className="rounded-lg border border-gray-300 p-3 hover:bg-gray-50"
              >
                <Heart
                  className={`h-5 w-5 ${
                    isInWishlist(product.id) ? 'fill-pink-500 text-pink-500' : 'text-gray-600'
                  }`}
                />
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
