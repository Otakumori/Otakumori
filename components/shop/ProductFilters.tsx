 
 
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ProductFiltersProps {
  placeholder?: string;
}

export default function ProductFilters({
  placeholder = 'Search products...',
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  const updateSearchParams = (newParams: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchParams({ q: searchQuery });
  };

  const handleCategoryChange = (category: string) => {
    updateSearchParams({ category, q: searchQuery });
  };

  const handlePriceRangeChange = (min: string, max: string) => {
    updateSearchParams({
      minPrice: min || '',
      maxPrice: max || '',
      q: searchQuery,
    });
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 transition-all"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-pink-500 hover:bg-pink-600 text-black px-4 py-2 rounded-xl font-semibold transition-colors"
        >
          Search
        </button>
      </form>

      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Categories</h3>
        <div className="space-y-2">
          {['All', 'Apparel', 'Accessories', 'Collectibles', 'Gaming'].map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category === 'All' ? '' : category)}
              className={`w-full text-left px-3 py-2 rounded-xl transition-colors ${
                searchParams.get('category') === category ||
                (!searchParams.get('category') && category === 'All')
                  ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">Price Range</h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            placeholder="Min"
            min="0"
            step="0.01"
            defaultValue={searchParams.get('minPrice') || ''}
            onChange={(e) =>
              handlePriceRangeChange(e.target.value, searchParams.get('maxPrice') || '')
            }
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-pink-500/50"
          />
          <input
            type="number"
            placeholder="Max"
            min="0"
            step="0.01"
            defaultValue={searchParams.get('maxPrice') || ''}
            onChange={(e) =>
              handlePriceRangeChange(searchParams.get('minPrice') || '', e.target.value)
            }
            className="px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-pink-500/50"
          />
        </div>
      </div>

      {/* Clear Filters */}
      {(searchParams.get('q') ||
        searchParams.get('category') ||
        searchParams.get('minPrice') ||
        searchParams.get('maxPrice')) && (
        <button
          onClick={() => router.push('/shop')}
          className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
