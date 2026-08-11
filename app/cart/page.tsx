import { generateSEO } from '@/app/lib/seo';
import { MoriContainer, MoriPage, MoriSectionHeading } from '../components/mori';
import FooterDark from '../components/FooterDark';
import CartContent from '../components/shop/CartContent';
import { t } from '@/lib/microcopy';


export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/cart',
  });
}
export default async function CartPage() {
  return (
    <>
      <MoriPage className="relative z-10">
        <MoriContainer className="max-w-4xl py-8">
          <div className="mb-8">
            <MoriSectionHeading as="h1" className="md:text-4xl">
              {t('cart', 'gatherGear')}
            </MoriSectionHeading>
            <p className="mt-2 text-[var(--mori-parchment-muted)]">
              Review your inventory before proceeding to checkout.
            </p>
          </div>

          <CartContent />
        </MoriContainer>
      </MoriPage>
      <FooterDark />
    </>
  );
}
