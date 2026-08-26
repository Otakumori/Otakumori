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
    <main className="mori-page overflow-hidden pt-24">
      <div className="mori-shell py-10 sm:py-14">
        <DecorativeSectionHeader
          eyebrow="Curated grove market"
          title="Shop the Otaku-mori collection"
          description="Anime and game-inspired pieces presented with calm product framing, clear variants, and room for the art to do the work."
        />

        <StorefrontPanel className="mt-9 border-white/[0.09] bg-[#0b080c]/76 p-4 shadow-[0_22px_60px_rgba(0,0,0,0.34)] sm:p-6">
          <div className="mb-6 grid gap-4 border-b border-white/[0.08] pb-5 text-sm leading-6 text-[#cdbbb7]/78 md:grid-cols-3">
            <p>
              <span className="font-semibold text-[#fff1e4]">Product art stays primary.</span> Apparel,
              pins, stickers, and soft goods use framing that protects the design.
            </p>
            <p>
              <span className="font-semibold text-[#fff1e4]">Variants stay legible.</span> Cards show
              starting prices while detail pages handle the full choice.
            </p>
            <p>
              <span className="font-semibold text-[#fff1e4]">Curation stays clean.</span> Hidden or
              archived products remain out of the public storefront.
            </p>
          </div>
          <BuyReadyShopCatalog />
        </StorefrontPanel>
      </div>
    </main>
  );
}
