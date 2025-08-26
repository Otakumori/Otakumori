/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  url: string;
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const response = await fetch('/api/shop/products');
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data); // Debug log
          
          if (data.products && Array.isArray(data.products)) {
            // Transform Printify data and limit to 8 items
            const transformedProducts = data.products
              .filter((p: any) => p.published !== false) // Include products that are published or don't have published field
              .slice(0, 8)
              .map((p: any) => ({
                id: p.id,
                title: p.title,
                price: typeof p.price === 'number' ? p.price : (p.variants?.[0]?.price || 0) / 100,
                image: p.images?.[0]?.src || p.images?.[0] || '/placeholder-product.jpg',
                url: `/shop/product/${p.id}`,
              }));
            
            if (transformedProducts.length > 0) {
              setProducts(transformedProducts);
            } else {
              // No products found, use fallback
              setProducts(getFallbackProducts());
            }
          } else {
            console.warn('No products array in response, using fallback');
            setProducts(getFallbackProducts());
          }
        } else {
          console.error('API response not ok:', response.status, response.statusText);
          setError(`API Error: ${response.status}`);
          setProducts(getFallbackProducts());
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError('Failed to fetch products');
        setProducts(getFallbackProducts());
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getFallbackProducts = (): Product[] => [
    {
      id: '1',
      title: 'Cherry Blossom Tee',
      price: 29.99,
      image: '/placeholder-product.jpg',
      url: '/shop',
    },
    {
      id: '2',
      title: 'Pixel Art Hoodie',
      price: 49.99,
      image: '/placeholder-product.jpg',
      url: '/shop',
    },
    {
      id: '3',
      title: 'Otaku-mori Sticker Pack',
      price: 9.99,
      image: '/placeholder-product.jpg',
      url: '/shop',
    },
    {
      id: '4',
      title: 'Digital Shrine Poster',
      price: 19.99,
      image: '/placeholder-product.jpg',
      url: '/shop',
    },
    {
      id: '5',
      title: 'Retro Gaming Mug',
      price: 14.99,
      image: '/placeholder-product.jpg',
      url: '/shop',
    },
    {
      id: '6',
      title: 'Anime Character Pin Set',
      price: 12.99,
      image: '/placeholder-product.jpg',
      url: '/shop',
    },
    {
      id: '7',
      title: 'Gaming Mousepad',
      price: 24.99,
      image: '/placeholder-product.jpg',
      url: '/shop',
    },
    {
      id: '8',
      title: 'Limited Edition Poster',
      price: 34.99,
      image: '/placeholder-product.jpg',
      url: '/shop',
    },
  ];

  if (loading) {
    return (
      <section id="featured-products" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-800">Featured</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-3 h-48 rounded-lg bg-gray-200"></div>
                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="featured-products" className="bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-3xl font-bold text-gray-800">Featured</h2>
        
        {error && (
          <div className="mb-8 text-center">
            <p className="text-amber-600 bg-amber-50 px-4 py-2 rounded-lg inline-block">
              ⚠️ {error} - Showing sample products
            </p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {products.map(product => (
            <Link key={product.id} href={product.url} className="group">
              <div className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 font-medium text-gray-800">{product.title}</h3>
                  <p className="text-lg font-bold text-purple-600">${product.price.toFixed(2)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-block rounded-full bg-purple-600 px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-purple-700"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
