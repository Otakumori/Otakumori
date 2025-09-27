'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import type { PrintifyProduct } from '@/app/lib/printify/service';

// Enterprise-grade Product Card for Real Printify Products
function RealPrintifyProductCard({ product }: { product: PrintifyProduct }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0] || null);
  const [selectedImage, setSelectedImage] = useState(product.images[0] || null);

  // Get available colors and sizes from product options
  const colorOptions = product.options?.find((opt) => opt.name.toLowerCase().includes('color'));
  const sizeOptions = product.options?.find((opt) => opt.name.toLowerCase().includes('size'));

  // Get variant-specific image
  const variantImages = selectedVariant
    ? product.images.filter(
        (img) => img.variant_ids.length === 0 || img.variant_ids.includes(selectedVariant.id),
      )
    : product.images;

  const displayImage = variantImages[0] || product.images[0];

  // Calculate price range
  const prices = product.variants.map((v) => v.price).filter((p) => p > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceDisplay =
    minPrice === maxPrice
      ? `$${(minPrice / 100).toFixed(2)}`
      : `$${(minPrice / 100).toFixed(2)} - $${(maxPrice / 100).toFixed(2)}`;

  // Get available variants for current color
  const availableVariants = product.variants.filter((v) => v.is_enabled && v.is_available);

  return (
    <div className="group bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden hover:border-pink-500/50 transition-all duration-300">
      {/* Product Image */}
      <div className="relative aspect-square bg-white/5">
        {displayImage ? (
          <Image
            src={displayImage.src}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <div className="text-white/60 text-lg font-medium">No Image</div>
          </div>
        )}

        {/* Badge for stock status */}
        {availableVariants.length === 0 && (
          <div className="absolute top-2 right-2 bg-red-500/80 text-white text-xs px-2 py-1 rounded-lg">
            Out of Stock
          </div>
        )}

        {/* Express eligible badge */}
        {product.is_printify_express_eligible && (
          <div className="absolute top-2 left-2 bg-green-500/80 text-white text-xs px-2 py-1 rounded-lg">
            Express
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Title and Price */}
        <div>
          <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2 group-hover:text-pink-300 transition-colors">
            {product.title}
          </h3>
          <div className="text-pink-400 font-bold text-xl">{priceDisplay}</div>
        </div>

        {/* Description */}
        <p className="text-zinc-300 text-sm line-clamp-2 leading-relaxed">
          {product.description || 'High-quality print-on-demand product'}
        </p>

        {/* Color Variants */}
        {colorOptions && colorOptions.values.length > 1 && (
          <div>
            <div className="text-white text-xs font-medium mb-2">Colors:</div>
            <div className="flex flex-wrap gap-1">
              {colorOptions.values.slice(0, 6).map((colorValue) => (
                <div key={colorValue.id} className="group/color relative" title={colorValue.title}>
                  {colorValue.colors && colorValue.colors.length > 0 ? (
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white/30 cursor-pointer hover:border-pink-400 transition-colors"
                      style={{ backgroundColor: colorValue.colors[0] }}
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-white/30 cursor-pointer hover:border-pink-400 transition-colors" />
                  )}
                </div>
              ))}
              {colorOptions.values.length > 6 && (
                <div className="text-zinc-400 text-xs self-center">
                  +{colorOptions.values.length - 6} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Size Options */}
        {sizeOptions && sizeOptions.values.length > 1 && (
          <div>
            <div className="text-white text-xs font-medium mb-2">Sizes Available:</div>
            <div className="flex flex-wrap gap-1">
              {sizeOptions.values.slice(0, 4).map((sizeValue) => (
                <span
                  key={sizeValue.id}
                  className="text-xs bg-white/10 text-zinc-300 px-2 py-1 rounded-lg"
                >
                  {sizeValue.title}
                </span>
              ))}
              {sizeOptions.values.length > 4 && (
                <span className="text-xs text-zinc-400">+{sizeOptions.values.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <button
          className="w-full bg-gradient-to-r from-pink-500/80 to-purple-500/80 hover:from-pink-500 hover:to-purple-500 text-white font-medium py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={availableVariants.length === 0}
        >
          {availableVariants.length > 0 ? 'View Details' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}

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
                <RealPrintifyProductCard key={product.id} product={product} />
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
