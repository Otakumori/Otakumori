import { generateSEO } from '@/app/lib/seo';
import type { Metadata } from 'next';
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
      <main className="relative z-10 min-h-screen bg-[#080611]">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">{t('cart', 'gatherGear')}</h1>
            <p className="mt-2 text-zinc-300/90">Review your items before proceeding to checkout</p>
          </div>

          <CartContent />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
