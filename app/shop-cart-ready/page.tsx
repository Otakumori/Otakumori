import { generateSEO } from '@/app/lib/seo';
import BuyReadyShopCatalog from '../components/shop/BuyReadyShopCatalog';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Shop Cart Ready',
    description: 'Provider-backed storefront with quantity, add-to-cart, and checkout-ready detail flow.',
    url: '/shop-cart-ready',
  });
}

export default function ShopCartReadyPage() {
  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pink-200 mb-4">Otaku-mori Shop</h1>
          <p className="text-xl text-pink-200/70 max-w-2xl mx-auto">
            Starting prices on the grid, option-driven detail pages, and live add-to-cart plus checkout actions.
          </p>
        </div>
        <BuyReadyShopCatalog />
      </div>
    </main>
  );
}
