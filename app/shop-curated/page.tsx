import { generateSEO } from '@/app/lib/seo';
import ProviderShopCatalog from '../components/shop/ProviderShopCatalog';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Shop Curated',
    description: 'Provider-backed storefront with placeholders removed.',
    url: '/shop-curated',
  });
}

export default function ShopCuratedPage() {
  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pink-200 mb-4">Otaku-mori Shop</h1>
          <p className="text-xl text-pink-200/70 max-w-2xl mx-auto">
            Provider-backed products only. Placeholder and seed items removed.
          </p>
        </div>
        <ProviderShopCatalog />
      </div>
    </main>
  );
}
