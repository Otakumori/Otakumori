import { generateSEO } from '@/app/lib/seo';
import LiteShopCatalog from '../components/shop/LiteShopCatalog';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Shop Lite',
    description: 'Fallback storefront for catalog verification and recovery.',
    url: '/shop-lite',
  });
}

export default function ShopLitePage() {
  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pink-200 mb-4">Otaku-mori Shop Lite</h1>
          <p className="text-xl text-pink-200/70 max-w-2xl mx-auto">
            Lightweight fallback storefront while the full shop route is being stabilized.
          </p>
        </div>
        <LiteShopCatalog />
      </div>
    </main>
  );
}
