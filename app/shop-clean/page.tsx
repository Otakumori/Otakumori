import { generateSEO } from '@/app/lib/seo';
import CleanProviderShopCatalog from '../components/shop/CleanProviderShopCatalog';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Shop Clean',
    description: 'Cleaner provider-backed storefront with stronger dedupe and sanitized descriptions.',
    url: '/shop-clean',
  });
}

export default function ShopCleanPage() {
  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pink-200 mb-4">Otaku-mori Shop</h1>
          <p className="text-xl text-pink-200/70 max-w-2xl mx-auto">
            Cleaner provider-backed storefront with duplicate entries reduced and description text sanitized.
          </p>
        </div>
        <CleanProviderShopCatalog />
      </div>
    </main>
  );
}
