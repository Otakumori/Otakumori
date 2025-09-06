// DEPRECATED: This component is a duplicate. Use app\components\layout\Navbar.tsx instead.
import Link from 'next/link';
import GlassPanel from './GlassPanel';
import { auth } from '@clerk/nextjs/server';
import { t } from '@/lib/microcopy';
import { env } from '@/env';

async function getCartCount() {
  try {
    const { getToken } = await auth();
    const token = await getToken({ template: 'otakumori-jwt' }); // ensure template exists in Clerk
    const res = await fetch(`${env.NEXT_PUBLIC_SITE_URL ?? ''}/api/v1/shop/cart/summary`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data?.count ?? 0);
  } catch { return 0; }
}

export default async function NavBar() {
  const count = await getCartCount();
  return (
    <header className="sticky top-0 z-20">
      <GlassPanel className="mx-3 mt-3 px-4 py-3 md:mx-6 md:mt-4 md:px-6">
        <nav className="flex items-center justify-between gap-6">
          <Link href="/" className="font-semibold tracking-wide text-fuchsia-200 hover:text-fuchsia-100">
            {t("brand", "siteName")}
          </Link>
          <ul className="flex items-center gap-5 text-sm text-zinc-200">
            <li><Link className="hover:text-white/90 transition-colors" href="/">{t("nav", "home")}</Link></li>
            <li><Link className="hover:text-white/90 transition-colors" href="/shop">{t("nav", "shop")}</Link></li>
            <li><Link className="hover:text-white/90 transition-colors" href="/blog">{t("nav", "blog")}</Link></li>
            <li><Link className="hover:text-white/90 transition-colors" href="/games">{t("nav", "miniGames")}</Link></li>
            <li>
              <Link className="hover:text-white/90 transition-colors" href="/cart">
                {t("cart", "gatherGear")}{count > 0 ? ` (${count})` : ''}
              </Link>
            </li>
          </ul>
        </nav>
      </GlassPanel>
    </header>
  );
}
