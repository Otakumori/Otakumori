import { generateSEO } from '@/app/lib/seo';
import LiveProviderShopCatalog from '../components/shop/LiveProviderShopCatalog';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Shop Live',
    description: 'Deduped provider-backed storefront while product detail pages are being stabilized.',
    url: '/shop-live',
  });
}

export default function ShopLivePage() {
  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pink-200 mb-4">Otaku-mori Shop</h1>
          <p className="text-xl text-pink-200/70 max-w-2xl mx-auto">
            Deduped provider-backed products only. Broken detail links temporarily removed.
          </p>
        </div>
        <LiveProviderShopCatalog />
      </div>
    </main>
  );
}
