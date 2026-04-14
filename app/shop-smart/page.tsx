import { generateSEO } from '@/app/lib/seo';
import SmartReadyShopCatalog from '../components/shop/SmartReadyShopCatalog';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Shop Smart',
    description: 'Provider-backed storefront with starting prices and option-driven detail behavior.',
    url: '/shop-smart',
  });
}

export default function ShopSmartPage() {
  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pink-200 mb-4">Otaku-mori Shop</h1>
          <p className="text-xl text-pink-200/70 max-w-2xl mx-auto">
            Starting prices on the grid. Option-driven price and image behavior on the detail page.
          </p>
        </div>
        <SmartReadyShopCatalog />
      </div>
    </main>
  );
}
