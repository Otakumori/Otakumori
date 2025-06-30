'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext.tsx';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  isNSFW: boolean;
}

export function FeaturedProducts() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = React.useState<Product[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/featured');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-gray-800/50 p-4">
            <div className="mb-4 aspect-square rounded-lg bg-gray-700" />
            <div className="mb-2 h-6 w-3/4 rounded bg-gray-700" />
            <div className="h-4 w-1/2 rounded bg-gray-700" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {products
        .filter(product => !product.isNSFW || isAuthenticated)
        .map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={`/shop/${product.id}`}>
              <div className="group relative overflow-hidden rounded-lg bg-gray-800/50 transition-colors duration-300 hover:bg-gray-800/70">
                <div className="relative aspect-square">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.isNSFW && (
                    <div className="absolute right-2 top-2 rounded-full bg-pink-600 px-2 py-1 text-xs text-white">
                      NSFW
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="mb-2 text-xl font-bold text-white">{product.name}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-gray-300">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-pink-500">${product.price.toFixed(2)}</span>
                    <span className="text-sm text-white/50">View Details →</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
    </div>
  );
}
