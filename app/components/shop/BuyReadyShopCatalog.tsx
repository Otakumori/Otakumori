'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import type { CatalogProduct } from '@/lib/catalog/serialize';
import { ProductGrid } from './StorefrontProductCard';
import { MoriButton } from '../mori/MoriFoundation';
import styles from './commerce-composition.module.css';

interface ApiResponse {
  ok?: boolean;
  data?: {
    products?: CatalogProduct[];
    filters?: { availableCategories?: string[] };
  };
  products?: CatalogProduct[];
}

function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/&[a-z]+;/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isBuyReadyProduct(product: CatalogProduct) {
  const hasPrice =
    typeof product.price === 'number' ||
    typeof product.priceCents === 'number' ||
    typeof product.priceRange?.min === 'number';
  const hasImage = Boolean((product.image ?? product.images?.[0] ?? '').trim());
  const hasAvailableVariant = Boolean(
    product.variants?.some((variant) => variant.isEnabled && variant.inStock),
  );
  return hasPrice && hasImage && hasAvailableVariant;
}

function dedupeProducts(products: CatalogProduct[]) {
  const seen = new Set<string>();
  const deduped: CatalogProduct[] = [];
  for (const product of products) {
    const key = [product.provider ?? 'prisma', normalizeTitle(product.title)].join('::');
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(product);
  }
  return deduped;
}

export default function BuyReadyShopCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('title-asc');
  const [query, setQuery] = useState('limit=48&sortBy=title&sortOrder=asc');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/v1/catalog?${query}`, {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Catalog unavailable');
        const payload = (await response.json()) as ApiResponse;
        if (payload.ok === false) throw new Error('Catalog unavailable');
        const loaded = payload.data?.products ?? payload.products ?? [];
        if (!cancelled) {
          setProducts(dedupeProducts(loaded.filter(isBuyReadyProduct)));
          setCategories(payload.data?.filters?.availableCategories ?? []);
        }
      } catch {
        if (!cancelled) setError('unavailable');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [query, retry]);

  const visibleProducts = useMemo(() => products.slice(0, 24), [products]);
  const hasFilters =
    new URLSearchParams(query).has('q') || new URLSearchParams(query).has('category');

  function applyControls(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const [sortBy, sortOrder] = sort.split('-');
    const params = new URLSearchParams({ limit: '48', sortBy, sortOrder });
    if (search.trim()) params.set('q', search.trim());
    if (category) params.set('category', category);
    setQuery(params.toString());
  }

  function clearFilters() {
    setSearch('');
    setCategory('');
    setSort('title-asc');
    setQuery('limit=48&sortBy=title&sortOrder=asc');
  }

  return (
    <>
      <form className={styles.controls} onSubmit={applyControls} aria-label="Catalogue controls">
        <div className={styles.search}>
          <div className={styles.field}>
            <label htmlFor="catalogue-search">Search the collection</label>
            <input
              id="catalogue-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <MoriButton type="submit">Search</MoriButton>
        </div>
        <details className={styles.filters}>
          <summary>Filter and sort</summary>
          <div className={styles.filterFields}>
            {categories.length > 0 ? (
              <div className={styles.field}>
                <label htmlFor="catalogue-category">Category</label>
                <select
                  id="catalogue-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">All categories</option>
                  {categories.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className={styles.field}>
              <label htmlFor="catalogue-sort">Sort by</label>
              <select
                id="catalogue-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="title-asc">Name: A–Z</option>
                <option value="title-desc">Name: Z–A</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
            <MoriButton type="submit">Apply</MoriButton>
          </div>
        </details>
        {hasFilters ? (
          <MoriButton variant="secondary" onClick={clearFilters}>
            Clear filters
          </MoriButton>
        ) : null}
      </form>
      <div role="status" className="sr-only">
        {loading
          ? 'Loading products'
          : error
            ? 'Storefront temporarily unavailable'
            : `${visibleProducts.length} products displayed`}
      </div>
      <div aria-busy={loading}>
        {loading ? (
          <div className={styles.catalogue} data-testid="product-grid" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index}>
                <div className={styles.skeleton} />
                <div className={styles.skeletonText} />
                <div className={styles.skeletonText} />
              </div>
            ))}
          </div>
        ) : error ? (
          <section className={styles.state}>
            <h2>Storefront temporarily unavailable</h2>
            <p>We couldn&apos;t load the collection. Please try again.</p>
            <MoriButton onClick={() => setRetry((value) => value + 1)}>Try again</MoriButton>
          </section>
        ) : visibleProducts.length === 0 ? (
          <section className={styles.state} data-testid="product-grid">
            <h2>{hasFilters ? 'No matching pieces' : 'The collection is between arrivals'}</h2>
            <p>
              {hasFilters
                ? 'Try another search or clear your filters.'
                : 'There are no available pieces to browse right now. Please check back soon.'}
            </p>
            {hasFilters ? (
              <MoriButton onClick={clearFilters}>Browse all products</MoriButton>
            ) : null}
          </section>
        ) : (
          <ProductGrid products={visibleProducts} />
        )}
      </div>
    </>
  );
}
