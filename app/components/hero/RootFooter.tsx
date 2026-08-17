import Link from 'next/link';
import { paths } from '@/lib/paths';

const primaryLinks = [
  { label: 'Shop', href: paths.shop(), region: 'root-cavity-shop' },
  { label: 'Mini-Games', href: paths.games(), region: 'root-cavity-games' },
  { label: 'Blog', href: paths.blogIndex(), region: 'root-cavity-blog' },
  { label: 'About', href: '/about', region: 'root-cavity-about' },
  { label: 'Profile', href: paths.profile(), region: 'root-cavity-profile' },
  { label: 'Petals', href: '/profile/petals', region: 'root-cavity-petals' },
];

const utilityLinks = [
  { label: 'Help', href: paths.help() },
  { label: 'Privacy', href: paths.privacy() },
  { label: 'Terms', href: paths.terms() },
  { label: 'Cookies', href: paths.cookies() },
];

export default function RootFooter() {
  return (
    <footer
      className="relative mx-auto mt-auto w-full max-w-7xl pb-5 pt-10"
      aria-labelledby="home-root-footer-title"
      data-testid="mori-root-footer"
      data-root-footer-contract="production-art-pending"
    >
      <div
        className="pointer-events-none absolute inset-x-[-8vw] top-0 h-px bg-gradient-to-r from-transparent via-[#dfb9a2]/34 to-transparent"
        aria-hidden="true"
        data-root-region="world-to-root-joint"
      />
      <div
        className="pointer-events-none absolute inset-x-[-8vw] top-0 h-40 bg-[radial-gradient(ellipse_at_9%_0%,rgba(73,42,36,0.62),transparent_42%),radial-gradient(ellipse_at_45%_0%,rgba(51,31,30,0.44),transparent_46%),linear-gradient(to_bottom,rgba(9,5,7,0.18),transparent)]"
        aria-hidden="true"
        data-root-region="surface-lighting-hook"
      />
      <div className="relative grid gap-8 border-t border-[#f6dcc7]/14 pt-8 md:grid-cols-[1.05fr_1.15fr] md:items-end">
        <div data-root-region="footer-voice">
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

        <div className="grid gap-5" data-root-region="html-navigation-cavities">
          <nav
            aria-label="Rooted homepage navigation"
            className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3"
          >
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                data-root-region={link.region}
                className="rounded-full border border-[#f6dcc7]/14 bg-[#080509]/24 px-4 py-3 text-center text-[#fff4e8]/82 backdrop-blur-[2px] transition hover:border-[#f3b3c8]/42 hover:bg-[#f3b3c8]/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/26"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <nav
            aria-label="Homepage utility navigation"
            className="flex flex-wrap justify-start gap-2 text-xs text-[#f7dcd5]/58 md:justify-end"
            data-root-region="utility-legal-band"
          >
            {utilityLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={false}
                className="rounded-full px-3 py-2 transition hover:bg-[#f3b3c8]/10 hover:text-[#fff4e8] focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/26"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
