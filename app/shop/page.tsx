/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { safeFetch } from '@/lib/fetcher';
import { Product } from '@/lib/z';
import ProductGrid from '@/components/shop/ProductGrid';
import ProductFilters from '@/components/shop/ProductFilters';

async function loadProducts(q: string | undefined) {
  const url = q ? `/api/products?q=${encodeURIComponent(q)}` : '/api/products';
  const res = await safeFetch<{ items: unknown[] }>(url);
  if (!res.ok) return [];
  return res.data.items.map((p) => Product.parse(p));
}

export default async function ShopPage({ searchParams }: { searchParams: { q?: string } }) {
  const items = await loadProducts(searchParams?.q);
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <ProductFilters placeholder="Whatt're ya buyin'?" />
      </div>
      <ProductGrid products={items} />
    </div>
  );
}
