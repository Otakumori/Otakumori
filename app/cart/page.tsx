import { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import NavBar from '../components/NavBar';
import FooterDark from '../components/FooterDark';
import CartContent from '../components/shop/CartContent';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Cart — Otaku-mori',
  description: 'Review your items before checkout.',
};

async function getCartItems() {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: 'otakumori-jwt' });
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/v1/shop/cart`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 };
    return response.json();
  } catch {
    return { items: [], subtotal: 0, tax: 0, shipping: 0, total: 0 };
  }
}

export default async function CartPage() {
  const cartData = await getCartItems();

  return (
    <>
      <NavBar />
      <main className="relative z-10 min-h-screen bg-[#080611]">
        <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {t("cart", "gatherGear")}
            </h1>
            <p className="mt-2 text-zinc-300/90">
              Review your items before proceeding to checkout
            </p>
          </div>
          
          <CartContent cartData={cartData} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
