import { generateSEO } from '@/app/lib/seo';
import BuyReadyShopCatalog from '../components/shop/BuyReadyShopCatalog';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Shop',
    description: 'Browse our anime and gaming merchandise',
    url: '/shop',
  });
}

export default function ShopPage() {
  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pink-200 mb-4">Otaku-mori Shop</h1>
          <p className="text-xl text-pink-200/70 max-w-2xl mx-auto">
            Starting prices on the grid, option-driven detail pages, and working cart-aware product flow.
          </p>
        </div>
        <BuyReadyShopCatalog />
      </div>
    </main>
  );
}
