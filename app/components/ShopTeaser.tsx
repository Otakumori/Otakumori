'use client';

import GlassPanel from './GlassPanel';
import Image from 'next/image';
import Link from 'next/link';
import { t } from '@/lib/microcopy';
import { useState, useEffect } from 'react';

interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  available: boolean;
  slug: string;
}

export default function ShopTeaser() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/shop/products');

        if (response.ok) {
          const data = await response.json();

          if (data.products && Array.isArray(data.products)) {
            // Transform Printify products to display format and limit to 4
            // Filter out products without images or with placeholder images
            const transformedProducts = data.products
              .filter((product: any) => {
                const imageUrl = product.images?.[0]?.src || product.images?.[0];
                return (
                  imageUrl &&
                  !imageUrl.includes('placeholder') &&
                  !imageUrl.includes('seed:') &&
                  imageUrl.trim() !== ''
                );
              })
              .slice(0, 4)
              .map((product: any) => ({
                id: product.id,
                title: product.title,
                description: product.description,
                image: product.images?.[0]?.src || product.images?.[0],
                price: product.variants?.[0]?.price || product.price || 0,
                available: product.variants?.some((v: any) => v.is_enabled && v.is_available) || true,
                slug: product.id,
              }));

            setProducts(transformedProducts);
          } else {
            console.warn('No products array in response');
            setProducts([]);
          }
        } else {
          console.error('API response not ok:', response.status, response.statusText);
          setError(`API Error: ${response.status}`);
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Failed to fetch products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section id="shop" className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          {t('nav', 'shop')}
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Discover exclusive anime merchandise and gaming accessories
        </p>
      </div>

      {/* Products Grid or States */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          </div>
          <h3 className="text-xl text-white mb-2">Loading Products...</h3>
          <p className="text-gray-400">Fetching featured items</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-2xl text-red-400"></span>
          </div>
          <h3 className="text-xl text-white mb-2">Unable to Load Products</h3>
          <p className="text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {products.map((product) => (
            <GlassPanel
              key={product.id}
              className="group relative overflow-hidden hover:scale-105 transition-all duration-300"
            >
              <Link href={`/shop?productId=${product.id}`} className="block">
                <div className="aspect-square relative mb-4">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Status badges */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    {!product.available && (
                      <div className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-lg">
                        Out of Stock
                      </div>
                    )}
                    {/* Published status - show if we have the data */}
                    {(product as any).visible !== undefined && (
                      <div
                        className={`text-xs px-2 py-1 rounded-lg font-medium ${
                          (product as any).visible && (product as any).active
                            ? 'bg-green-500/80 text-white'
                            : 'bg-yellow-500/80 text-white'
                        }`}
                        title={
                          (product as any).visible && (product as any).active
                            ? 'Published'
                            : 'Unpublished'
                        }
                      >
                        {(product as any).visible && (product as any).active ? '✓' : '⚠'}
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-white font-semibold mb-2 line-clamp-2">{product.title}</h3>

                {/* Price display */}
                <p className="text-pink-400 font-bold">${(product.price / 100).toFixed(2)}</p>

                {/* Description preview */}
                {product.description && (
                  <p className="text-gray-300 text-sm mt-2 line-clamp-2">{product.description}</p>
                )}
              </Link>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white/60"></span>
          </div>
          <h3 className="text-xl text-white mb-2">Shop Coming Soon</h3>
          <p className="text-gray-400">Featured products will appear here</p>
        </div>
      )}

      {/* View All CTA */}
      {products.length > 0 && (
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
          >
            Browse All Products
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}
