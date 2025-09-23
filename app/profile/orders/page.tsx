import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import FooterDark from '../../components/FooterDark';
import OrdersList from '../../components/profile/OrdersList';
import { t } from '@/lib/microcopy';

export const metadata: Metadata = {
  title: 'Orders — Otaku-mori',
  description: 'View your order history and track shipments.',
};

async function getOrders() {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: 'otakumori-jwt' });

    const { env } = await import('@/env');
    const siteUrl = env.NEXT_PUBLIC_SITE_URL || '';

    const response = await fetch(`${siteUrl}/api/v1/shop/orders`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function OrdersPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/profile/orders');
  }

  const orders = await getOrders();

  return (
    <>
      <Navbar />
      <main className="relative z-10 min-h-screen bg-[#080611]">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white md:text-4xl">{t('orders', 'title')}</h1>
            <p className="mt-2 text-zinc-300/90">{t('orders', 'subtitle')}</p>
          </div>

          <OrdersList orders={orders} />
        </div>
      </main>
      <FooterDark />
    </>
  );
}
