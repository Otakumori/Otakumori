import { generateSEO } from '@/app/lib/seo';
import BuyReadyShopCatalog from '@/app/components/shop/BuyReadyShopCatalog';

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
    <main className="relative min-h-screen overflow-hidden bg-[#06040c] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(255,106,169,0.18),transparent_32%),radial-gradient(circle_at_80%_18%,rgba(247,197,107,0.10),transparent_30%),linear-gradient(180deg,#100817,#06040c_52%,#020103)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-200/50 to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-28">
        <div className="mb-12 max-w-3xl">
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-[#f7c56b]">Buy-ready relics</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-normal text-pink-50 md:text-6xl">Shop the grove without breaking the spell.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-pink-50/70">
            Every visible item has an image, price, and enabled in-stock option so the path from product to cart to checkout stays clean.
          </p>
        </div>
        <BuyReadyShopCatalog />
      </div>
    </main>
  );
}
