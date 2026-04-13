import { generateSEO } from '@/app/lib/seo';
import ReadyProviderShopCatalog from '../components/shop/ReadyProviderShopCatalog';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Shop Ready',
    description: 'Provider-backed storefront with working detail page flow.',
    url: '/shop-ready',
  });
}

export default function ShopReadyPage() {
  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pink-200 mb-4">Otaku-mori Shop</h1>
          <p className="text-xl text-pink-200/70 max-w-2xl mx-auto">
            Provider-backed storefront with clean cards and working detail page flow.
          </p>
        </div>
        <ReadyProviderShopCatalog />
      </div>
    </main>
  );
}
