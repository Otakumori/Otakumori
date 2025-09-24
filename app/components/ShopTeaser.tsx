import GlassPanel from './GlassPanel';
import Image from 'next/image';
import Link from 'next/link';
import { t } from '@/lib/microcopy';

type Product = { id: string; name: string; price: number; image: string; slug?: string };

// Mock featured products for now until Printify integration is properly set up
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Sakura Cherry Blossom T-Shirt',
    price: 2999, // Price in cents
    image: '/placeholder-product.jpg',
    slug: 'sakura-cherry-blossom-tshirt',
  },
  {
    id: '2',
    name: 'Anime Gaming Controller',
    price: 4999,
    image: '/placeholder-product.jpg',
    slug: 'anime-gaming-controller',
  },
  {
    id: '3',
    name: 'Otaku-mori Sticker Pack',
    price: 1499,
    image: '/placeholder-product.jpg',
    slug: 'otaku-mori-sticker-pack',
  },
  {
    id: '4',
    name: 'Mini-Games Poster Collection',
    price: 1999,
    image: '/placeholder-product.jpg',
    slug: 'mini-games-poster-collection',
  },
];

export default async function ShopTeaser() {
  // Use sample products for now, later replace with real Printify service
  const products = SAMPLE_PRODUCTS;

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

      {/* Products Grid or Empty State */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {products.map((p) => (
            <GlassPanel
              key={p.id}
              className="group relative overflow-hidden hover:scale-105 transition-all duration-300"
            >
              <Link href={`/shop/${p.slug}`} className="block">
                <div className="aspect-square relative mb-4">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover rounded-lg group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <h3 className="text-white font-semibold mb-2 line-clamp-2">{p.name}</h3>
                <p className="text-pink-400 font-bold">${(p.price / 100).toFixed(2)}</p>
              </Link>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white/60">🛍️</span>
          </div>
          <h3 className="text-xl text-white mb-2">Shop Coming Soon</h3>
          <p className="text-gray-400">Featured products will appear here</p>
        </div>
      )}

      {/* View All CTA */}
      {products.length > 0 && (
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
          >
            Browse All Products
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}
