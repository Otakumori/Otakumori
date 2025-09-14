import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import FooterDark from '../components/FooterDark';
import CheckoutContent from '../components/shop/CheckoutContent';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Checkout — Otaku-mori',
  description: 'Complete your purchase securely.',
};

export default async function CheckoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/checkout');
  }

  return (
    <>
      <main className="relative z-10 min-h-screen bg-[#080611]">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {t('cart', 'checkoutClarity')}
            </h1>
            <p className="mt-2 text-zinc-300/90">{t('cart', 'checkoutFlavor')}</p>
          </div>

          <CheckoutContent />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
