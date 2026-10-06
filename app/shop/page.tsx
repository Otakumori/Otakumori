import { generateSEO } from '@/app/lib/seo';
import BuyReadyShopCatalog from '../components/shop/BuyReadyShopCatalog';
import { MoriSectionHeader } from '../components/mori/MoriFoundation';
import styles from '../components/shop/commerce-composition.module.css';

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
    <main className={`om-route-page om-route-page--shop ${styles.page}`}>
      <div className={styles.shell}>
        <MoriSectionHeader
          headingLevel={1}
          className={styles.introduction}
          title="The Otaku-mori collection"
          description="Anime and game-inspired goods. Find something to make yours."
        />

        <section aria-label="Curated products">
          <BuyReadyShopCatalog />
        </section>
      </div>
    </main>
  );
}
