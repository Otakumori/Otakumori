import { Suspense } from 'react';
import type { Metadata } from 'next';
import StarfieldPurple from '../components/StarfieldPurple';
import NavBar from '../components/NavBar';
import FooterDark from '../components/FooterDark';
import ShopCatalog from '../components/shop/ShopCatalog';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Shop — Otaku-mori',
  description: 'Discover anime gaming treasures and collectibles.',
};

async function loadProducts(searchParams: { sort?: string; q?: string; page?: string; category?: string }) {
  const params = new URLSearchParams();
  if (searchParams.sort) params.set('sort', searchParams.sort);
  if (searchParams.q) params.set('q', searchParams.q);
  if (searchParams.page) params.set('page', searchParams.page);
  if (searchParams.category) params.set('category', searchParams.category);

  const url = `/api/v1/products?${params.toString()}`;
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}${url}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) return { products: [], total: 0, page: 1, totalPages: 1 };
  return response.json();
}

export default async function ShopPage({ 
  searchParams 
}: { 
  searchParams: { sort?: string; q?: string; page?: string; category?: string } 
}) {
  const data = await loadProducts(searchParams);

  return (
    <>
      <StarfieldPurple />
      <NavBar />
      <main className="relative z-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {t("nav", "shop")}
            </h1>
            <p className="mt-2 text-zinc-300/90">
              Discover treasures from the digital abyss
            </p>
          </div>
          
          <Suspense fallback={<ShopCatalogSkeleton />}>
            <ShopCatalog 
              products={data.products || []}
              total={data.total || 0}
              currentPage={parseInt(searchParams.page || '1')}
              totalPages={data.totalPages || 1}
              searchParams={searchParams}
            />
          </Suspense>
        </div>
      </main>
      <FooterDark />
    </>
  );
}

function ShopCatalogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 bg-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl p-4 animate-pulse">
            <div className="aspect-[4/5] bg-white/10 rounded-xl mb-3" />
            <div className="h-4 bg-white/10 rounded mb-2" />
            <div className="h-3 bg-white/10 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
