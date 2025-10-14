'use client';

import { useRecentlyViewed } from '@/app/hooks/useRecentlyViewed';
import Image from 'next/image';
import Link from 'next/link';

export function RecentlyViewed() {
  const { recentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-white mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recentlyViewed.map((product) => (
          <Link
            key={product.id}
            href={`/shop/product/${product.id}`}
            className="group bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden hover:border-pink-500/50 transition-all duration-300"
          >
            <div className="relative aspect-square">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 16vw"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm text-white font-medium line-clamp-2 mb-1">{product.title}</h3>
              <p className="text-pink-400 font-bold text-sm">${(product.price / 100).toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
