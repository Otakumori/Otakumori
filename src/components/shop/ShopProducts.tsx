'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getShopProducts, type ShopProduct, type ShopFilters, type ShopSort } from '@/src/lib/shop';
import { addToCart } from '@/src/lib/cart';

interface ShopProductsProps {
  category?: string;
  query?: string;
  page: number;
  sort: string;
}

export default function ShopProducts({ category, query, page, sort }: ShopProductsProps) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);

        // Parse sort parameter
        const sortMap: Record<string, ShopSort> = {
          newest: { field: 'createdAt', direction: 'desc' },
          oldest: { field: 'createdAt', direction: 'asc' },
          'name-asc': { field: 'name', direction: 'asc' },
          'name-desc': { field: 'name', direction: 'desc' },
          'price-low': { field: 'name', direction: 'asc' }, // We'll sort by price in the query
          'price-high': { field: 'name', direction: 'desc' }, // We'll sort by price in the query
        };

        const sortConfig = sortMap[sort] || sortMap['newest'];

        // Build filters
        const filters: ShopFilters = {};
        if (query) filters.query = query;
        if (category && category !== 'all') {
          // Note: Category filtering is not implemented in current schema
          // This is a placeholder for future implementation
        }

        const result = await getShopProducts(filters, sortConfig, page, 24);
        setProducts(result.products);
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (err) {
        setError('Failed to load products');
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [category, query, page, sort]);

  const handleAddToCart = async (productId: string, variantId: string) => {
    try {
      await addToCart(productId, 1);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const formatPrice = (priceCents: number | null, currency: string | null = 'USD') => {
    if (priceCents === null) return 'Price not available';
    const price = priceCents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square bg-white/5 rounded-lg mb-3" />
              <div className="h-4 bg-white/5 rounded mb-2" />
              <div className="h-3 bg-white/5 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">
          <span role="img" aria-label="Disappointed face">
            😔
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
        <p className="text-white/60 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">
          <span role="img" aria-label="Cherry blossom">
            🌸
          </span>
        </div>
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-white/60">
          {query ? `No products match "${query}"` : 'No products available at the moment'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/60">
          Showing {products.length} of {total} products
        </p>

        {/* Sort Options */}
        <label htmlFor="sort-select" className="sr-only">
          Sort products
        </label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            params.set('sort', e.target.value);
            params.delete('page');
            window.location.search = params.toString();
          }}
          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:border-white/40"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-low">Price Low to High</option>
          <option value="price-high">Price High to Low</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const defaultVariant = product.variants[0];
          const imageUrl =
            product.primaryImageUrl ||
            defaultVariant?.previewImageUrl ||
            '/images/products/placeholder.svg';

          return (
            <div key={product.id} className="group glass neon-edge p-4 rounded-lg">
              <Link href={`/shop/product/${product.id}`} className="block">
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-white/5 overflow-hidden rounded-lg mb-3">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                {/* Product Info */}
                <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-pink-400 transition-colors">
                  {product.name}
                </h3>

                {product.description && (
                  <p className="text-sm text-white/60 mb-3 line-clamp-2">{product.description}</p>
                )}

                {/* Price */}
                <div className="text-lg font-bold text-pink-400 mb-3">
                  {defaultVariant
                    ? formatPrice(defaultVariant.priceCents, defaultVariant.currency)
                    : 'Price not available'}
                </div>

                {/* Stock Status */}
                {defaultVariant && (
                  <div className="text-xs text-white/60 mb-3">
                    {defaultVariant.inStock ? (
                      <span className="text-green-400">✓ In Stock</span>
                    ) : (
                      <span className="text-red-400">✗ Out of Stock</span>
                    )}
                  </div>
                )}
              </Link>

              {/* Add to Cart Button */}
              {defaultVariant && defaultVariant.inStock && (
                <button
                  onClick={() => handleAddToCart(product.id, defaultVariant.id)}
                  className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Add to Cart
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {total > 24 && (
        <div className="flex items-center justify-center space-x-2 pt-8">
          {page > 1 && (
            <Link
              href={`/shop?${new URLSearchParams({
                ...Object.fromEntries(new URLSearchParams(window.location.search)),
                page: (page - 1).toString(),
              })}`}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Previous
            </Link>
          )}

          <span className="px-4 py-2 text-white/60">
            Page {page} of {Math.ceil(total / 24)}
          </span>

          {hasMore && (
            <Link
              href={`/shop?${new URLSearchParams({
                ...Object.fromEntries(new URLSearchParams(window.location.search)),
                page: (page + 1).toString(),
              })}`}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
