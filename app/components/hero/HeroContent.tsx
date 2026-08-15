import Link from 'next/link';
import { paths } from '@/lib/paths';
import HeroSearch from './HeroSearch';

const footerLinks = [
  { label: 'Shop', href: paths.shop() },
  { label: 'Mini-Games', href: paths.games() },
  { label: 'Blog', href: paths.blogIndex() },
  { label: 'Profile', href: paths.profile() },
  { label: 'Petals', href: '/profile/petals' },
  { label: 'Cart', href: paths.cart() },
];

export default function HeroContent() {
  return (
    <div className="relative z-20 flex min-h-[138svh] flex-col px-4 pb-8 pt-24 text-[#fff4e8] sm:px-6 md:min-h-[128svh] md:px-10 xl:min-h-[122svh]">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-7xl items-end pb-[11svh] md:items-center md:justify-end md:pb-0 md:pt-14">
        <div className="w-full max-w-[33rem] text-left md:mr-[5vw] lg:mr-[8vw]">
          <div className="w-fit rounded-full border border-[#f7d7c8]/16 bg-[#080509]/18 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#f2bfd1]/86 shadow-[0_10px_34px_rgba(0,0,0,0.28)] backdrop-blur-[2px]">
            Sanctuary open
          </div>

          <h1
            id="home-hero-title"
            className="font-display mt-4 max-w-[30rem] text-balance text-2xl font-semibold leading-tight tracking-tight text-[#fff1e4] drop-shadow-[0_3px_18px_rgba(0,0,0,0.72)] sm:text-3xl md:text-4xl"
          >
            Welcome to the sanctuary, traveler.
          </h1>

          <HeroSearch />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href={paths.shop()}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#ffe3ca]/52 bg-[#f7c2bf]/18 px-6 text-sm font-semibold text-[#fff3e6] shadow-[0_16px_44px_rgba(0,0,0,0.36)] backdrop-blur-md transition hover:border-[#fff1df]/78 hover:bg-[#f8bdc9]/25 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/35"
            >
              Gear up &rarr;
            </Link>
            <span className="text-xs font-medium text-[#f7dcd5]/76 drop-shadow-[0_2px_10px_rgba(0,0,0,0.78)]">
              Add to bottomless cart.
            </span>
            <Link
              href="/profile/petals"
              className="inline-flex min-h-[40px] items-center rounded-full border border-[#f3b3c8]/22 bg-[#09060b]/32 px-4 text-xs font-semibold text-[#ffe9ef] backdrop-blur-[3px] transition hover:border-[#f3b3c8]/48 hover:bg-[#f3b3c8]/10 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/25"
            >
              Petals drift from the tree
            </Link>
          </div>
        </div>
      </div>

      <footer
        className="relative mx-auto mt-auto w-full max-w-7xl pb-5 pt-10"
        aria-labelledby="home-root-footer-title"
        data-testid="mori-root-footer"
      >
        <div className="pointer-events-none absolute inset-x-[-8vw] top-0 h-px bg-gradient-to-r from-transparent via-[#dfb9a2]/34 to-transparent" />
        <div className="pointer-events-none absolute inset-x-[-8vw] top-0 h-40 bg-[radial-gradient(ellipse_at_9%_0%,rgba(73,42,36,0.62),transparent_42%),radial-gradient(ellipse_at_45%_0%,rgba(51,31,30,0.44),transparent_46%),linear-gradient(to_bottom,rgba(9,5,7,0.18),transparent)]" />
        <div className="relative grid gap-8 border-t border-[#f6dcc7]/14 pt-8 md:grid-cols-[1.1fr_1fr] md:items-end">
          <div>
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.3em] text-[#f2bfd1]/76">
              Fresh Blooms
            </p>
            <h2
              id="home-root-footer-title"
              className="font-display mt-3 max-w-xl text-2xl font-semibold text-[#fff1e4] drop-shadow-[0_3px_14px_rgba(0,0,0,0.7)] md:text-3xl"
            >
              The roots keep the world together.
            </h2>
            <p className="font-body mt-3 max-w-xl text-sm leading-7 text-[#f7dcd5]/72">
              The world isn&apos;t perfect, but your taste in anime, games, and websites are.
            </p>
          </div>

          <nav
            aria-label="Rooted homepage navigation"
            className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-[#f6dcc7]/14 bg-[#080509]/24 px-4 py-3 text-center text-[#fff4e8]/82 backdrop-blur-[2px] transition hover:border-[#f3b3c8]/42 hover:bg-[#f3b3c8]/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/26"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
