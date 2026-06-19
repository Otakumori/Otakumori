import Image from 'next/image';
import Link from 'next/link';
import { paths } from '@/lib/paths';

export default function StaticPublicNavbar() {
  const links = [
    { href: paths.home(), label: 'Home' },
    { href: paths.shop(), label: 'Shop' },
    { href: paths.games(), label: 'Mini-Games' },
    { href: paths.blogIndex(), label: 'Blog' },
    { href: '/community', label: 'Community' },
  ];

  return (
    <header className="relative z-50 w-full border-b border-white/10 bg-[#1a1816]/80 font-ui">
      <a
        href="#main-content"
        className="sr-only absolute left-2 top-2 z-50 rounded bg-pink-700 px-3 py-1 text-white focus:not-sr-only"
      >
        Skip to main content
      </a>
      <nav className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href={paths.home()} className="flex items-center py-1" aria-label="Otaku-mori home">
          <div className="relative h-20 w-20 md:h-24 md:w-24">
            <Image
              src="/assets/images/circlelogo.png"
              alt="Otaku-mori"
              fill
              priority
              sizes="(min-width: 768px) 96px, 80px"
              className="object-contain"
            />
          </div>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="min-h-[44px] px-2 py-3 text-sm text-text-link transition-colors hover:text-text-link-hover"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={paths.cart()}
            className="min-h-[44px] rounded-lg border border-white/15 px-4 py-3 text-sm text-text-link transition-colors hover:text-text-link-hover"
          >
            Cart
          </Link>
        </div>
      </nav>
    </header>
  );
}
