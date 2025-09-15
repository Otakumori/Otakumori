import GlassPanel from './GlassPanel';
import Image from 'next/image';
import Link from 'next/link';
import { t } from '@/lib/microcopy';
import { env } from '@/server/env';

type Product = { id: string; name: string; price: number; image: string; slug?: string };

async function getFeatured(): Promise<Product[]> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/v1/products/featured`, {
    cache: 'no-store', // Force fresh data on each request
  });
  if (!res.ok) return [];
  return (await res.json()) as Product[];
}

export default async function ShopTeaser() {
  const products = await getFeatured();
  if (!products.length) return null;

  return (
    <section id="shop" className="relative z-10 mx-auto max-w-7xl px-4 md:px-6">
      {/* Section Header */}
      <div className="mb-12 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
          {t('nav', 'shop')}
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          Discover exclusive anime merchandise and gaming accessories
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {products.slice(0, 4).map((p) => (
          <GlassPanel
            key={p.id}
            className="group overflow-hidden hover:scale-105 transition-all duration-300"
          >
            <Link href={`/shop/${p.slug ?? p.id}`} className="block">
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-4 bg-black/20 backdrop-blur-sm">
                <div className="text-sm font-medium text-white mb-1 line-clamp-2">{p.name}</div>
                <div className="text-lg font-bold text-pink-400">${p.price}</div>
              </div>
            </Link>
          </GlassPanel>
        ))}
      </div>

      {/* View All Button */}
      <div className="text-center">
        <Link
          href="/shop"
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          View All Products
          <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
