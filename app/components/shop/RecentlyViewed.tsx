'use client';

import { useState, useMemo } from 'react';
import { useRecentlyViewed } from '@/app/hooks/useRecentlyViewed';
import Image from 'next/image';
import Link from 'next/link';
import { paths } from '@/lib/paths';

interface RecentlyViewedProps {
  excludeProductId?: string;
  itemsPerPage?: number;
}

export function RecentlyViewed({ excludeProductId, itemsPerPage = 12 }: RecentlyViewedProps) {
  const { recentlyViewed } = useRecentlyViewed();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter out the current product if provided
  const filtered = useMemo(() => {
    return excludeProductId
      ? recentlyViewed.filter((p) => p.id !== excludeProductId)
      : recentlyViewed;
  }, [recentlyViewed, excludeProductId]);

  // Extract categories from product titles/tags (simple categorization)
  const categories = useMemo(() => {
    const cats = new Set<string>(['all']);
    filtered.forEach((product) => {
      const title = product.title.toLowerCase();
      if (title.includes('tee') || title.includes('shirt') || title.includes('crop')) {
        cats.add('apparel');
      } else if (title.includes('pin') || title.includes('collar') || title.includes('magnet')) {
        cats.add('accessories');
      } else if (title.includes('pillow') || title.includes('decal') || title.includes('sticker')) {
        cats.add('home');
      } else {
        cats.add('other');
      }
    });
    return Array.from(cats);
  }, [filtered]);

  // Filter by category
  const categoryFiltered = useMemo(() => {
    if (selectedCategory === 'all') return filtered;
    return filtered.filter((product) => {
      const title = product.title.toLowerCase();
      switch (selectedCategory) {
        case 'apparel':
          return title.includes('tee') || title.includes('shirt') || title.includes('crop');
        case 'accessories':
          return title.includes('pin') || title.includes('collar') || title.includes('magnet');
        case 'home':
          return title.includes('pillow') || title.includes('decal') || title.includes('sticker');
        default:
          return true;
      }
    });
  }, [filtered, selectedCategory]);

  // Paginate
  const totalPages = Math.ceil(categoryFiltered.length / itemsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return categoryFiltered.slice(start, start + itemsPerPage);
  }, [categoryFiltered, currentPage, itemsPerPage]);

  if (filtered.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Recently Viewed</h2>
        {categories.length > 1 && (
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-pink-500/80 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {paginated.length === 0 ? (
        <p className="text-zinc-400 text-center py-8">No products in this category.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {paginated.map((product) => (
              <Link
                key={product.id}
                href={paths.product(product.id)}
                className="group bg-white/10 backdrop-blur-lg rounded-xl border border-glass-border overflow-hidden hover:border-border-hover transition-all duration-300"
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
                  <h3 className="text-sm text-white font-medium line-clamp-2 mb-1">
                    {product.title}
                  </h3>
                  <p className="text-text-link-hover font-bold text-sm">
                    ${(product.priceCents / 100).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                Previous
              </button>
              <span className="text-white text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white/10 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
