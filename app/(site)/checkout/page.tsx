import { generateSEO } from '@/app/lib/seo';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import FooterDark from '@/app/components/FooterDark';
import CheckoutContent from '@/app/components/shop/CheckoutContent';
import { t } from '@/lib/microcopy';
import { paths } from '@/lib/paths';


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
    redirect(paths.signIn(paths.checkout()));
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
