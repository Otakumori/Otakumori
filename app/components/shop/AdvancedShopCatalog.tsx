'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { FeaturedCarousel } from './FeaturedCarousel';
import { RecentlyViewed } from './RecentlyViewed';
import Link from 'next/link';
import { paths } from '@/lib/paths';
import { stripHtml } from '@/lib/html';

// Catalog Product Card
function CatalogProductCard({ product }: { product: CatalogProduct }) {
  const displayImage = product.image ?? product.images?.[0] ?? '';

  // Don't render products without images
  if (!displayImage || displayImage.includes('placeholder') || displayImage.includes('seed:') || displayImage.trim() === '') {
    return null;
  }

  const summary = useMemo(() => stripHtml(product.description || ''), [product.description]);

  const minPriceCents = product.priceRange.min ?? product.priceCents ?? null;
  const maxPriceCents = product.priceRange.max ?? product.priceCents ?? null;
  const priceDisplay =
    minPriceCents != null && maxPriceCents != null
      ? minPriceCents === maxPriceCents
        ? `$${(minPriceCents / 100).toFixed(2)}`
        : `$${(minPriceCents / 100).toFixed(2)} - $${(maxPriceCents / 100).toFixed(2)}`
      : product.price != null
        ? `$${product.price.toFixed(2)}`
        : '$0.00';

  const colorOptions = Array.from(
    new Map(
      product.variants
        .flatMap((variant) => variant.optionValues ?? [])
        .filter((value) => value.option?.toLowerCase().includes('color'))
        .map((value) => [value?.value ?? '', value]),
    ).values(),
  );

  const sizeOptions = Array.from(
    new Map(
      product.variants
        .flatMap((variant) => variant.optionValues ?? [])
        .filter((value) => value.option?.toLowerCase().includes('size'))
        .map((value) => [value?.value ?? '', value]),
    ).values(),
  );

  return (
    <div className="group bg-white/10 backdrop-blur-lg rounded-2xl border border-glass-border overflow-hidden hover:border-border-hover hover:shadow-2xl hover:shadow-[0_0_30px_var(--glow-pink)] transition-all duration-300 hover:-translate-y-1">
      {displayImage ? (
        <div className="relative aspect-square bg-white/5 overflow-hidden">
          <Image
            src={displayImage}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
            {!product.available && (
              <div className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-lg">
                Out of Stock
              </div>
            )}
            {product.visible !== undefined && (
              <div
                className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  product.visible && product.active
                    ? 'bg-green-500/80 text-white'
                    : 'bg-yellow-500/80 text-white'
                }`}
                title={
                  product.visible && product.active
                    ? 'Published - Visible to customers'
                    : !product.visible
                      ? 'Unpublished - Hidden from customers'
                      : 'Inactive - Not available'
                }
              >
                {product.visible && product.active ? '✓ Published' : '⚠ Unpublished'}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative aspect-square bg-white/5 overflow-hidden flex items-center justify-center">
          <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
            {!product.available && (
              <div className="bg-red-500/80 text-white text-xs px-2 py-1 rounded-lg">
                Out of Stock
              </div>
            )}
            {product.visible !== undefined && (
              <div
                className={`text-xs px-2 py-1 rounded-lg font-medium ${
                  product.visible && product.active
                    ? 'bg-green-500/80 text-white'
                    : 'bg-yellow-500/80 text-white'
                }`}
                title={
                  product.visible && product.active
                    ? 'Published - Visible to customers'
                    : !product.visible
                      ? 'Unpublished - Hidden from customers'
                      : 'Inactive - Not available'
                }
              >
                {product.visible && product.active ? '✓ Published' : '⚠ Unpublished'}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div>
          <Link href={paths.product(product.id)} className="block">
            <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2 group-hover:text-text-link-hover transition-colors">
              {product.title}
            </h3>
          </Link>
          <div className="text-text-link-hover font-bold text-xl">{priceDisplay}</div>
        </div>

        <p className="text-zinc-300 text-sm line-clamp-2 leading-relaxed">
          {summary || 'High-quality print-on-demand product'}
        </p>

        {colorOptions.length > 1 && (
          <div>
            <div className="text-white text-xs font-medium mb-2">Colors:</div>
            <div className="flex flex-wrap gap-1">
              {colorOptions.slice(0, 6).map((option) => (
                <div
                  key={`${option?.option}-${option?.value}`}
                  title={option?.value ?? ''}
                  className="w-6 h-6 rounded-full border-2 border-white/30 cursor-default"
                  style={{ backgroundColor: option?.colors?.[0] ?? '#fff' }}
                />
              ))}
              {colorOptions.length > 6 && (
                <div className="text-zinc-400 text-xs self-center">
                  +{colorOptions.length - 6} more
                </div>
              )}
            </div>
          </div>
        )}

        {sizeOptions.length > 1 && (
          <div>
            <div className="text-white text-xs font-medium mb-2">Sizes:</div>
            <div className="flex flex-wrap gap-1">
              {sizeOptions.slice(0, 6).map((option) => (
                <span
                  key={`${option?.option}-${option?.value}`}
                  className="text-xs bg-white/10 text-zinc-300 px-2 py-1 rounded-lg"
                >
                  {option?.value}
                </span>
              ))}
              {sizeOptions.length > 6 && (
                <span className="text-xs text-zinc-400">+{sizeOptions.length - 6} more</span>
              )}
            </div>
          </div>
        )}

        {product.tags.length > 0 && (
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

        <Link
          href={paths.product(product.id)}
          className="block w-full bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary hover:to-accent text-center text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_var(--glow-pink-strong)] hover:scale-105 active:scale-95"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

interface ProductSearchResult {
  products: CatalogProduct[];
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
        <option value="title-asc">Name: A to Z</option>
        <option value="title-desc">Name: Z to A</option>
        <option value="created_at-desc">Newest First</option>
        <option value="created_at-asc">Oldest First</option>
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

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<ProductSearchResult | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<CatalogProduct[]>([]);

  // Parse search parameters
  const filters = useMemo(
    () => ({
      q: (searchParams.q as string) || '',
      category: (searchParams.category as string) || '',
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
      inStock: searchParams.inStock === 'true',
      publishedOnly: searchParams.publishedOnly === 'true',
      sortBy: (searchParams.sortBy as string) || 'relevance',
      sortOrder: (searchParams.sortOrder as string) || 'desc',
      page: Number(searchParams.page) || 1,
      limit: Number(searchParams.limit) || 20,
    }),
    [searchParams],
  );

  // Fetch featured products for carousel (once on mount)
  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch('/api/v1/products/featured?limit=5', {
          credentials: 'same-origin',
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          const featured = (data.products || []).slice(0, 5) as CatalogProduct[];
          setFeaturedProducts(featured);
        }
      } catch (err) {
        console.warn('Failed to load featured products:', err);
      }
    }

    fetchFeatured();
  }, []);

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
        if (filters.inStock) params.append('inStock', 'true');
        if (filters.publishedOnly) params.append('publishedOnly', 'true');
        params.append('sortBy', filters.sortBy);
        params.append('sortOrder', filters.sortOrder);
        params.append('page', filters.page.toString());
        params.append('limit', filters.limit.toString());

        const response = await fetch(`/api/v1/printify/search?${params.toString()}`, {
          credentials: 'same-origin',
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          // Handle HTTP errors gracefully
          const errorText = await response.text();
          console.warn(`Printify API returned ${response.status}: ${errorText}`);
          setSearchResult({
            products: [],
            total: 0,
            page: 1,
            totalPages: 0,
            filters: {
              availableCategories: [],
              priceRange: { min: 0, max: 0 },
              availableColors: [],
              availableSizes: [],
            },
          });
          setProducts([]);
          setError('Unable to load products at this time. Please try again later.');
          return;
        }

        const result = await response.json();

        if (result.ok || result.products) {
          const data = result.data || result;
          // Products are already deduplicated server-side by blueprintId
          const products = (data.products || []) as CatalogProduct[];

          setSearchResult({
            products,
            total: data.pagination?.total ?? data.total ?? 0,
            page: data.pagination?.page ?? data.page ?? 1,
            totalPages: data.pagination?.totalPages ?? data.totalPages ?? 0,
            filters: data.filters ?? {
              availableCategories: [],
              priceRange: { min: 0, max: 0 },
              availableColors: [],
              availableSizes: [],
            },
          });
          setProducts(products);
          setError(null);
        } else {
          setSearchResult({
            products: [],
            total: 0,
            page: 1,
            totalPages: 0,
            filters: {
              availableCategories: [],
              priceRange: { min: 0, max: 0 },
              availableColors: [],
              availableSizes: [],
            },
          });
          setProducts([]);
          setError('No products found. Please try different search criteria.');
        }
      } catch (err) {
        console.warn('Shop catalog fetch error:', err);
        setSearchResult({
          products: [],
          total: 0,
          page: 1,
          totalPages: 0,
          filters: {
            availableCategories: [],
            priceRange: { min: 0, max: 0 },
            availableColors: [],
            availableSizes: [],
          },
        });
        setProducts([]);
        setError('Connection error. Please check your internet connection and try again.');
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
    <div className="space-y-12">
      {/* Featured Products Carousel */}
      {featuredProducts.length > 0 && (
        <section className="container mx-auto px-4">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Featured Products</h2>
            <p className="text-zinc-300">Curated treasures for fellow travelers</p>
          </div>
          <FeaturedCarousel products={featuredProducts} autoplay={true} interval={6000} />
        </section>
      )}

      {/* Recently Viewed Products */}
      <RecentlyViewed />

      {/* Main Catalog Section */}
      <div className="container mx-auto px-4 py-0">
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
                <div className="block text-white text-sm mb-2">Price Range</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    aria-label="Minimum price"
                    value={filters.minPrice || ''}
                    onChange={(e) =>
                      updateFilters({
                        minPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-white placeholder-zinc-400 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice || ''}
                    onChange={(e) =>
                      updateFilters({
                        maxPrice: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl px-3 py-2 text-white placeholder-zinc-400 text-sm"
                    aria-label="Maximum price"
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
                    publishedOnly: false,
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
                {/* Published status summary */}
                {products.length > 0 && (
                  <div className="flex items-center gap-3 mt-2 text-sm">
                    <span className="text-zinc-400">
                      {products.filter((p) => p.visible && p.active).length} published
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400">
                      {products.filter((p) => !p.visible || !p.active).length} unpublished
                    </span>
                  </div>
                )}
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
            {products.filter((product) => {
              const imageUrl = product.image ?? product.images?.[0];
              const hasValidImage = imageUrl && !imageUrl.includes('placeholder') && !imageUrl.includes('seed:') && imageUrl.trim() !== '';
              // If publishedOnly filter is on, also filter by visible/active
              if (filters.publishedOnly && hasValidImage) {
                return product.visible !== false && product.active !== false;
              }
              return hasValidImage;
            }).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {products
                  .filter((product) => {
                    const imageUrl = product.image ?? product.images?.[0];
                    const hasValidImage = imageUrl && !imageUrl.includes('placeholder') && !imageUrl.includes('seed:') && imageUrl.trim() !== '';
                    // If publishedOnly filter is on, also filter by visible/active
                    if (filters.publishedOnly && hasValidImage) {
                      return product.visible !== false && product.active !== false;
                    }
                    return hasValidImage;
                  })
                  .map((product) => (
                    <CatalogProductCard key={product.id} product={product} />
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
                        inStock: false,
                        publishedOnly: false,
                      })
                    }
                    className="bg-primary/20 hover:bg-primary/30 text-text-link-hover px-6 py-3 rounded-xl transition-colors"
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
    </div>
  );
}
