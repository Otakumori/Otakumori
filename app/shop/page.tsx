import { generateSEO } from '@/app/lib/seo';
import BuyReadyShopCatalog from '../components/shop/BuyReadyShopCatalog';
import { DecorativeSectionHeader, StorefrontPanel } from '../components/shop/StorefrontPrimitives';

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
    <main className="relative min-h-screen overflow-hidden bg-[#080611] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,148,201,0.18),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(132,92,255,0.16),transparent_28%),linear-gradient(180deg,rgba(8,6,17,0.2),rgba(8,6,17,0.94))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[linear-gradient(90deg,transparent,rgba(255,222,233,0.08),transparent)]" />

      <div className="relative z-10 container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <DecorativeSectionHeader
          eyebrow="Curated grove market"
          title="Shop the Otaku-mori collection"
          description="A focused catalog of anime and game-inspired pieces, framed for quick browsing and calm checkout decisions."
        />

        <StorefrontPanel className="mt-10 p-4 sm:p-6">
          <div className="mb-6 grid gap-3 border-b border-pink-100/10 pb-5 text-sm text-[#f5d6dc]/68 md:grid-cols-3">
            <p>
              <span className="font-semibold text-pink-100">Images stay composed.</span> Shirts,
              shoes, pins, stickers, and soft goods use product-aware framing.
            </p>
            <p>
              <span className="font-semibold text-pink-100">Variants stay clear.</span> Cards show
              starting prices while detail pages handle option selection.
            </p>
            <p>
              <span className="font-semibold text-pink-100">Local curation stays safe.</span> Hidden
              or archived products remain out of the public storefront.
            </p>
          </div>
          <BuyReadyShopCatalog />
        </StorefrontPanel>
      </div>
    </main>
  );
}
