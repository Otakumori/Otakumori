'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { paths } from '@/lib/paths';

export default function StaticPublicNavbar() {
  const pathname = usePathname();
  const isHome = pathname === paths.home();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(false);
      return undefined;
    }

    const update = () => {
      const next = window.scrollY > 50;
      setIsScrolled((current) => (current === next ? current : next));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [isHome]);

  const links = [
    { href: paths.home(), label: 'Home' },
    { href: paths.shop(), label: 'Shop' },
    { href: paths.games(), label: 'Mini-Games' },
    { href: paths.blogIndex(), label: 'Blog' },
    { href: '/community', label: 'Community' },
  ];

  return (
    <header
      className={`z-50 w-full font-ui transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ${
        isHome ? 'absolute left-0 top-0' : 'relative border-b border-white/10 bg-[#1a1816]/80'
      } ${
        isHome && isScrolled
          ? 'border-b border-[#efd0bc]/24 bg-[#171017]/78 shadow-[0_8px_30px_rgba(4,2,5,0.28)] backdrop-blur-[5px]'
          : isHome
            ? 'border-b border-[#f4d5c4]/12 bg-[linear-gradient(to_bottom,rgba(12,7,12,0.42),rgba(12,7,12,0.12),transparent)] backdrop-blur-[2px]'
            : ''
      }`}
      data-home-navbar-state={isHome ? (isScrolled ? 'scrolled' : 'top') : 'interior'}
    >
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
              sizes="(min-width: 768px) 96px, 80px"
              className="object-contain"
            />
          </div>
        </Link>

        <div className="hidden flex-wrap items-center justify-end gap-3 md:flex md:gap-6">
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
        <details className="relative md:hidden">
          <summary className="min-h-[44px] list-none cursor-pointer rounded-full border border-[#f2d7c4]/28 bg-[#170d12]/42 px-4 py-3 text-sm text-[#fff0e7] marker:hidden focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/42 [&::-webkit-details-marker]:hidden">
            Menu
          </summary>
          <div
            className="absolute right-0 top-[calc(100%+0.5rem)] grid w-48 gap-1 rounded-xl border border-[#f2d7c4]/20 bg-[#170d12]/90 p-2 shadow-[0_12px_28px_rgba(0,0,0,0.3)] backdrop-blur-[5px]"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="min-h-[44px] rounded-lg px-3 py-3 text-sm text-[#fff0e7] transition hover:bg-[#f3b3c8]/12 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/42"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={paths.cart()}
              className="min-h-[44px] rounded-lg px-3 py-3 text-sm text-[#fff0e7] transition hover:bg-[#f3b3c8]/12 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/42"
            >
              Cart
            </Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
