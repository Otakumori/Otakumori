import { generateSEO } from '@/app/lib/seo';
import BuyReadyShopCatalog from '../components/shop/BuyReadyShopCatalog';
import { DecorativeSectionHeader } from '../components/shop/StorefrontPrimitives';

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
    <main className="om-route-page om-route-page--shop mori-page overflow-hidden pt-24">
      <div className="mori-shell py-10 sm:py-14">
        <DecorativeSectionHeader
          eyebrow="Curated grove market"
          title="Shop the Otaku-mori collection"
          description="Anime and game-inspired pieces presented with calm product framing, clear variants, and room for the art to do the work."
        />
        <div aria-hidden="true" className="om-provisional-rule mx-auto" />

        <section className="mt-9" aria-label="Curated products">
          <BuyReadyShopCatalog />
        </section>
      </div>
    </main>
  );
}
