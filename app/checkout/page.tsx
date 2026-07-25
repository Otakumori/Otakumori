import { generateSEO } from '@/app/lib/seo';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { MoriContainer, MoriPage, MoriSectionHeading } from '../components/mori';
import FooterDark from '../components/FooterDark';
import CheckoutContent from '../components/shop/CheckoutContent';
import { t } from '@/lib/microcopy';


export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/checkout',
  });
}
export default async function CheckoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/checkout');
  }

  return (
    <>
      <MoriPage className="relative z-10">
        <MoriContainer className="max-w-4xl py-8">
          <div className="mb-8">
            <MoriSectionHeading as="h1" className="md:text-4xl">
              {t('cart', 'checkoutClarity')}
            </MoriSectionHeading>
            <p className="mt-2 text-[var(--mori-parchment-muted)]">{t('cart', 'checkoutFlavor')}</p>
          </div>

          <CheckoutContent />
        </MoriContainer>
      </MoriPage>
      <FooterDark />
    </>
  );
}
