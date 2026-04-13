import { generateSEO } from '@/app/lib/seo';
import ProofReadyShopCatalog from '../components/shop/ProofReadyShopCatalog';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Shop Proof',
    description: 'Minimal provider-backed storefront for validating detail-page flow.',
    url: '/shop-proof',
  });
}

export default function ShopProofPage() {
  return (
    <main className="relative min-h-screen vignette">
      <div className="relative z-40 container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-pink-200 mb-4">Otaku-mori Shop Proof</h1>
          <p className="text-xl text-pink-200/70 max-w-2xl mx-auto">
            Minimal storefront and detail flow test. No heavy extras.
          </p>
        </div>
        <ProofReadyShopCatalog />
      </div>
    </main>
  );
}
