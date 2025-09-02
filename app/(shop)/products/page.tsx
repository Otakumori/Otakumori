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
      throw new Error('Failed to fetch products');
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
    <div className="group relative overflow-hidden rounded-lg bg-white/10 backdrop-blur-sm transition-all hover:bg-white/20">
      <div className="aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white">{product.title}</h3>
        {product.description && (
          <p className="mt-2 text-sm text-gray-300 line-clamp-2">
            {product.description}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-pink-400">
            ${product.price.toFixed(2)}
          </span>
          <Link
            href={`/shop/${product.id}`}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              product.available
                ? 'bg-pink-500 text-white hover:bg-pink-600'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            {product.available ? 'View Details' : 'Out of Stock'}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductsGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">🌸</div>
        <h2 className="text-2xl font-bold text-white mb-2">No Products Available</h2>
        <p className="text-gray-400 text-center max-w-md">
          We're working on bringing you amazing products. Check back soon!
        </p>
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
        <div key={i} className="animate-pulse">
          <div className="aspect-square bg-gray-700 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="h-6 bg-gray-700 rounded w-16"></div>
            <div className="h-8 bg-gray-700 rounded w-24"></div>
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
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Our Products</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover our collection of unique anime-inspired merchandise, 
            carefully curated for the otaku in you.
          </p>
        </div>
        
        {loading ? <ProductsSkeleton /> : <ProductsGrid products={products} />}
      </div>
    </div>
  );
}
