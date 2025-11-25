
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  description?: string;
  image: string;
  price: number;
  available: boolean;
}

interface ProductsResponse {
  ok: boolean;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
    };
  };
}

async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/printify/products');

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data: ProductsResponse = await response.json();
    return data.ok ? data.data.products : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 transition-all duration-300 hover:bg-black/30 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/20">
      {/* Glassmorphic overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />

      {/* Image container with dark overlay */}
      <div className="aspect-square overflow-hidden relative">
        <Image
          src={product.image}
          alt={product.title}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Dark overlay on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-6 relative z-10">
        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-purple-200 transition-colors duration-300">
          {product.title}
        </h3>
        {product.description && (
          <p className="text-sm text-gray-400 line-clamp-2 mb-4 group-hover:text-gray-300 transition-colors duration-300">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            ${product.price.toFixed(2)}
          </span>
          <Link
            href={`/shop/${product.id}`}
            className={`rounded-xl px-6 py-3 text-sm font-medium transition-all duration-300 backdrop-blur-sm border ${
              product.available
                ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white border-purple-400/50 hover:from-purple-500/90 hover:to-pink-500/90 hover:border-purple-300/70 hover:shadow-lg hover:shadow-purple-500/25'
                : 'bg-gray-800/50 text-gray-400 border-gray-600/50 cursor-not-allowed'
            }`}
          >
            {product.available ? 'View Details' : 'Out of Stock'}
          </Link>
        </div>
      </div>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-pink-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:via-pink-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none" />
    </div>
  );
}

function ProductsGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 p-8 text-center">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">No Products Available</h2>
          <p className="text-gray-400 max-w-md">
            We're working on bringing you amazing products. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl bg-black/20 backdrop-blur-xl border border-white/10 p-6"
        >
          <div className="aspect-square bg-gray-800/50 rounded-xl mb-4"></div>
          <div className="h-5 bg-gray-800/50 rounded-lg mb-2"></div>
          <div className="h-3 bg-gray-800/50 rounded w-3/4 mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="h-7 bg-gray-800/50 rounded w-16"></div>
            <div className="h-10 bg-gray-800/50 rounded-xl w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Our Products</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover our collection of unique anime-inspired merchandise, carefully curated for the
            otaku in you.
          </p>
        </div>

        {loading ? <ProductsSkeleton /> : <ProductsGrid products={products} />}
      </div>
    </div>
  );
}
