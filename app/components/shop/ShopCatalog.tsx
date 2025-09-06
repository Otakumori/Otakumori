'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import GlassPanel from '../GlassPanel';
import { t } from '@/lib/microcopy';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  category?: string;
  inStock?: boolean;
};

type ShopCatalogProps = {
  products: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
  searchParams: { sort?: string; q?: string; page?: string; category?: string };
};

export default function ShopCatalog({ 
  products, 
  total, 
  currentPage, 
  totalPages, 
  searchParams 
}: ShopCatalogProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [sortBy, setSortBy] = useState(searchParams.sort || 'newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || '');

  const categories = ['All', 'Hoodies', 'T-Shirts', 'Accessories', 'Digital'];

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    const params = new URLSearchParams(searchParamsHook);
    params.set('sort', newSort);
    router.push(`/shop?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const params = new URLSearchParams(searchParamsHook);
    if (category === 'All') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    router.push(`/shop?${params.toString()}`);
  };

  const handlePriceFilter = () => {
    const params = new URLSearchParams(searchParamsHook);
    if (priceRange.min) params.set('minPrice', priceRange.min);
    if (priceRange.max) params.set('maxPrice', priceRange.max);
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Filter Toolbar */}
      <GlassPanel className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-300">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-300">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-fuchsia-400 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'All' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-300">Price:</label>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
            />
            <span className="text-zinc-400">-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-20 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:border-fuchsia-400 focus:outline-none"
            />
            <button
              onClick={handlePriceFilter}
              className="rounded-xl bg-fuchsia-500/90 px-4 py-2 text-sm text-white hover:bg-fuchsia-500"
            >
              Apply
            </button>
          </div>

          {/* Results count */}
          <div className="ml-auto text-sm text-zinc-300">
            {total} products found
          </div>
        </div>
      </GlassPanel>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <GlassPanel key={product.id} className="group overflow-hidden">
              <Link href={`/shop/${product.slug}`} className="block">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width:768px) 50vw, (max-width:1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-xl bg-red-500/90 px-3 py-1 text-sm text-white">
                        {t("shop", "soldOut")}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-white line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-300/90">${product.price}</p>
                </div>
              </Link>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-zinc-400">No products found matching your criteria.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const params = new URLSearchParams(searchParamsHook);
            params.set('page', page.toString());
            
            return (
              <Link
                key={page}
                href={`/shop?${params.toString()}`}
                className={`rounded-xl px-4 py-2 text-sm transition-colors ${
                  page === currentPage
                    ? 'bg-fuchsia-500/90 text-white'
                    : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                }`}
              >
                {page}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
