 
 
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getShopCategories } from '@/src/lib/shop';

interface ShopFiltersProps {
  currentCategory?: string;
}

export default function ShopFilters({ currentCategory }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<
    Array<{ slug: string; name: string; count: number }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getShopCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change
    params.delete('page');

    const newUrl = `/shop?${params.toString()}`;
    router.push(newUrl);
  };

  const handleCategoryChange = (category: string) => {
    updateFilters({ cat: category === 'all' ? undefined : category });
  };

  const handlePriceChange = (min?: string, max?: string) => {
    updateFilters({
      minPrice: min || undefined,
      maxPrice: max || undefined,
    });
  };

  const handleStockFilter = (inStock: boolean) => {
    updateFilters({ inStock: inStock.toString() });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-white/5 rounded animate-pulse" />
        <div className="h-4 bg-white/5 rounded animate-pulse" />
        <div className="h-4 bg-white/5 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryChange(category.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                currentCategory === category.slug || (!currentCategory && category.slug === 'all')
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="flex items-center justify-between">
                {category.name}
                <span className="text-xs opacity-60">({category.count})</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-sm font-medium mb-3">Price Range</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-white/60 mb-1">Min Price</label>
            <input
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              onChange={(e) =>
                handlePriceChange(e.target.value, searchParams.get('maxPrice') || undefined)
              }
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1">Max Price</label>
            <input
              type="number"
              placeholder="1000"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              onChange={(e) =>
                handlePriceChange(searchParams.get('minPrice') || undefined, e.target.value)
              }
            />
          </div>
        </div>
      </div>

      {/* Stock Filter */}
      <div>
        <h3 className="text-sm font-medium mb-3">Availability</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={searchParams.get('inStock') === 'true'}
              onChange={(e) => handleStockFilter(e.target.checked)}
              className="rounded border-white/20 bg-white/10 text-white focus:ring-white/40"
            />
            <span className="text-sm text-white/80">In Stock Only</span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      {(currentCategory ||
        searchParams.get('minPrice') ||
        searchParams.get('maxPrice') ||
        searchParams.get('inStock')) && (
        <div>
          <button
            onClick={() => router.push('/shop')}
            className="w-full px-4 py-2 text-sm border border-white/20 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
