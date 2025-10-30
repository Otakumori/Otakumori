'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type ApiEnvelope, type Product } from '@/app/lib/contracts';

interface FeaturedProduct {
  id: string;
  title: string;
  price: number;
  image: string;
  url: string;
}

const PLACEHOLDER_IMAGE = '/placeholder-product.jpg';
const MAX_FEATURED_PRODUCTS = 8;

async function getLogger() {
  const { logger } = await import('@/app/lib/logger');
  return logger;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);

        const response = await fetch('/api/shop/products', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error(`API response not ok (${response.status})`);
        }

        const payload: ApiEnvelope<{ products: Product[] }> = await response.json();
        if (!payload.ok) {
          throw new Error(payload.error);
        }

        const logger = await getLogger();
        logger.info('Featured products fetched', {
          extra: { count: payload.data.products.length },
        });

        const featured = transformProducts(payload.data.products);
        if (featured.length > 0) {
          setProducts(featured);
        } else {
          setProducts(getFallbackProducts());
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        const logger = await getLogger();
        logger.warn('Failed to fetch featured products', { extra: { error: message } });
        setProducts(getFallbackProducts());
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProducts();
  }, []);

  const heading = useMemo(() => 'Featured', []);

  if (isLoading) {
    return (
      <section id="featured-products" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">{heading}</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {Array.from({ length: MAX_FEATURED_PRODUCTS }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="mb-3 h-48 rounded-lg bg-white/10" />
                <div className="mb-2 h-4 rounded bg-white/10" />
                <div className="h-4 w-1/2 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-products" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold text-white">{heading}</h2>

        {error && (
          <div className="mb-8 text-center">
            <p className="inline-block rounded-lg border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-amber-200">
              {error} - Showing sample products
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={product.url} className="group">
              <div className="overflow-hidden rounded-lg bg-white/10 transition-all duration-300 hover:shadow-xl">
                <div className="relative h-48 bg-white/5">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-medium text-white">{product.title}</h3>
                  <p className="text-lg font-bold text-pink-400">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-block rounded-full bg-gradient-to-r from-pink-500 to-purple-500 px-8 py-3 font-semibold text-white transition-all duration-200 hover:shadow-lg"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

function transformProducts(products: Product[]): FeaturedProduct[] {
  return products
    .filter((product) => product.active !== false)
    .slice(0, MAX_FEATURED_PRODUCTS)
    .map((product) => {
      const primaryImage =
        product.primaryImageUrl ?? product.variants[0]?.previewImageUrl ?? PLACEHOLDER_IMAGE;
      const price = computeProductPrice(product);

      return {
        id: product.id,
        title: product.name,
        price,
        image: primaryImage,
        url: `/shop/product/${product.id}`,
      } satisfies FeaturedProduct;
    });
}

function computeProductPrice(product: Product): number {
  if (product.variants.length > 0) {
    const price = product.variants[0]?.priceCents;
    if (typeof price === 'number' && price > 0) {
      return price / 100;
    }
  }

  return 0;
}

function getFallbackProducts(): FeaturedProduct[] {
  const samples: Array<Omit<FeaturedProduct, 'id'> & { id: string }> = [
    { id: '1', title: 'Cherry Blossom Tee', price: 29.99, image: PLACEHOLDER_IMAGE, url: '/shop' },
    { id: '2', title: 'Pixel Art Hoodie', price: 49.99, image: PLACEHOLDER_IMAGE, url: '/shop' },
    {
      id: '3',
      title: 'Otaku-mori Sticker Pack',
      price: 9.99,
      image: PLACEHOLDER_IMAGE,
      url: '/shop',
    },
    {
      id: '4',
      title: 'Digital Shrine Poster',
      price: 19.99,
      image: PLACEHOLDER_IMAGE,
      url: '/shop',
    },
    { id: '5', title: 'Retro Gaming Mug', price: 14.99, image: PLACEHOLDER_IMAGE, url: '/shop' },
    {
      id: '6',
      title: 'Anime Character Pin Set',
      price: 12.99,
      image: PLACEHOLDER_IMAGE,
      url: '/shop',
    },
    { id: '7', title: 'Gaming Mousepad', price: 24.99, image: PLACEHOLDER_IMAGE, url: '/shop' },
    {
      id: '8',
      title: 'Limited Edition Poster',
      price: 34.99,
      image: PLACEHOLDER_IMAGE,
      url: '/shop',
    },
  ];

  return samples.slice(0, MAX_FEATURED_PRODUCTS);
}
