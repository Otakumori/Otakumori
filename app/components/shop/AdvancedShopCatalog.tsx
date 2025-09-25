'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import type { PrintifyProduct } from '@/app/lib/printify/service';

interface ProductSearchResult {
  products: PrintifyProduct[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    availableCategories: string[];
    priceRange: { min: number; max: number };
    availableColors: string[];
    availableSizes: string[];
  };
}

interface AdvancedShopCatalogProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Simple ProductSort component
function ProductSort({
  sortBy,
  sortOrder,
  onSortChange,
}: {
  sortBy: string;
  sortOrder: string;
  onSortChange: (sortBy: string, sortOrder: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-white text-sm">
        Sort by:
      </label>
      <select
        id="sort-select"
        value={`${sortBy}-${sortOrder}`}
        onChange={(e) => {
          const [newSortBy, newSortOrder] = e.target.value.split('-');
          onSortChange(newSortBy, newSortOrder);
        }}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-white text-sm"
      >
        <option value="relevance-desc">Relevance</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Name: A to Z</option>
        <option value="name-desc">Name: Z to A</option>
        <option value="created-desc">Newest First</option>
        <option value="created-asc">Oldest First</option>
      </select>
    </div>
  );
}

// Simple Pagination component
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
      >
        Previous
      </button>

      <span className="text-white px-4">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
      >
        Next
      </button>
    </div>
  );
}

export default function AdvancedShopCatalog({ searchParams }: AdvancedShopCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();

  const [products, setProducts] = useState<PrintifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<ProductSearchResult | null>(null);

  // Parse search parameters
  const filters = useMemo(
    () => ({
      q: (searchParams.q as string) || '',
      category: (searchParams.category as string) || '',
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      colors: searchParams.colors ? String(searchParams.colors).split(',') : [],
      sizes: searchParams.sizes ? String(searchParams.sizes).split(',') : [],
      inStock: searchParams.inStock === 'true',
      expressEligible: searchParams.expressEligible === 'true',
      sortBy: (searchParams.sortBy as string) || 'relevance',
      sortOrder: (searchParams.sortOrder as string) || 'desc',
      page: Number(searchParams.page) || 1,
      limit: Number(searchParams.limit) || 20,
    }),
    [searchParams],
  );

  // Fetch products using the advanced search API
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (filters.q) params.append('q', filters.q);
        if (filters.category) params.append('category', filters.category);
        if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
        if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
        if (filters.colors.length > 0) params.append('colors', filters.colors.join(','));
        if (filters.sizes.length > 0) params.append('sizes', filters.sizes.join(','));
        if (filters.inStock) params.append('inStock', 'true');
        if (filters.expressEligible) params.append('expressEligible', 'true');
        params.append('sortBy', filters.sortBy);
        params.append('sortOrder', filters.sortOrder);
        params.append('page', filters.page.toString());
        params.append('limit', filters.limit.toString());

        const response = await fetch(`/api/v1/printify/search?${params.toString()}`);
        const result = await response.json();

        if (result.ok) {
          setSearchResult(result.data);
          setProducts(result.data.products);
        } else {
          setError(result.error || 'Failed to load products');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [filters]);

  // Update URL with new filters
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const params = new URLSearchParams(currentSearchParams.toString());

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        params.delete(key);
      } else {
        params.set(key, Array.isArray(value) ? value.join(',') : String(value));
      }
    });

    // Reset to page 1 when filters change (except when changing page itself)
    if (!newFilters.page) {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filter Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-white/10 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Products Skeleton */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-96 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl border border-red-500/20 p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Failed to Load Products</h2>
            <p className="text-red-300 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-3 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h3 className="text-white font-semibold mb-4">Search & Filters</h3>

            {/* Search */}
            <div className="mb-6">
              <label htmlFor="search-input" className="block text-white text-sm mb-2">
                Search
              </label>
              <input
                id="search-input"
                type="text"
                value={filters.q}
                onChange={(e) => updateFilters({ q: e.target.value })}
                placeholder="Search products..."
                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-white placeholder-zinc-400"
              />
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label htmlFor="category-select" className="block text-white text-sm mb-2">
                Category
              </label>
              <select
                id="category-select"
                value={filters.category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-white"
              >
                <option value="">All Categories</option>
                <option value="clothing">Clothing</option>
                <option value="accessories">Accessories</option>
                <option value="posters">Posters</option>
                <option value="home-decor">Home Decor</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <label className="block text-white text-sm mb-2">Price Range</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) =>
                    updateFilters({ minPrice: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-white placeholder-zinc-400 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) =>
                    updateFilters({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
                  }
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-white placeholder-zinc-400 text-sm"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div className="mb-6">
              <label className="flex items-center text-white text-sm">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => updateFilters({ inStock: e.target.checked })}
                  className="mr-2 rounded"
                />
                In Stock Only
              </label>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() =>
                updateFilters({
                  q: '',
                  category: '',
                  minPrice: undefined,
                  maxPrice: undefined,
                  inStock: false,
                })
              }
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-xl transition-colors text-sm"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <p className="text-white text-lg">
                {searchResult?.total || 0} products found
                {filters.q && <span className="text-zinc-300"> for "{filters.q}"</span>}
              </p>
              {filters.category && <p className="text-zinc-400 text-sm">in {filters.category}</p>}
            </div>

            <ProductSort
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSortChange={(sortBy: string, sortOrder: string) =>
                updateFilters({ sortBy, sortOrder })
              }
            />
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4"
                >
                  <h3 className="text-white font-semibold mb-2">{product.title}</h3>
                  <p className="text-zinc-300 text-sm">{product.description}</p>
                  <div className="mt-4">
                    <span className="text-pink-400 font-bold">
                      ${product.variants?.[0]?.price || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
                <h3 className="text-xl font-bold text-white mb-4">No products found</h3>
                <p className="text-zinc-300 mb-6">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <button
                  onClick={() =>
                    updateFilters({
                      q: '',
                      category: '',
                      minPrice: undefined,
                      maxPrice: undefined,
                      colors: [],
                      sizes: [],
                      inStock: false,
                      expressEligible: false,
                    })
                  }
                  className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 px-6 py-3 rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}

          {/* Pagination */}
          {searchResult && searchResult.totalPages > 1 && (
            <Pagination
              currentPage={searchResult.page}
              totalPages={searchResult.totalPages}
              onPageChange={(page: number) => updateFilters({ page })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
