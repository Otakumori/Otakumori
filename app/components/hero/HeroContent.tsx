import Link from 'next/link';
import { paths } from '@/lib/paths';

const entryLinks = [
  { label: 'Shop', href: paths.shop(), description: 'Merch and drops' },
  { label: 'Mini-games', href: paths.games(), description: 'Play for petals' },
  { label: 'Blog', href: paths.blogIndex(), description: 'Lore and notes' },
  { label: 'Profile', href: paths.profile(), description: 'Traveler identity' },
];

export default function HeroContent() {
  return (
    <div className="relative z-20 flex min-h-[100svh] items-end px-4 pb-8 pt-28 sm:px-6 md:items-center md:py-20 lg:px-10">
      <div className="mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[minmax(0,0.98fr)_minmax(300px,0.52fr)] lg:items-end">
        <div className="max-w-3xl rounded-[2rem] border border-[#f6dcc7]/18 bg-[#09070c]/58 px-5 py-6 text-left shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-md sm:px-8 sm:py-8 md:rounded-[2.5rem]">
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.34em] text-[#f2bfd1]">
            Welcome, traveler
          </p>

          <h1
            id="home-hero-title"
            className="font-display mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-tight text-[#f8eadc] sm:text-5xl md:text-7xl"
          >
            The sakura grove is open.
          </h1>
          <p className="font-body mt-5 max-w-2xl text-base leading-8 text-[#f7dcd5]/82 md:text-lg">
            Step into Otaku-mori to shop anime-inspired goods, play small rituals, and tend your
            traveler identity under the ancient tree.
          </p>

          <form
            action="/search"
            className="mt-7 flex flex-col gap-3 rounded-[1.5rem] border border-[#f7d7c8]/20 bg-black/32 p-3 shadow-inner shadow-black/30 sm:flex-row"
            role="search"
          >
            <label htmlFor="home-world-search" className="sr-only">
              Search Otaku-mori products, games, and stories
            </label>
            <input
              id="home-world-search"
              name="q"
              type="search"
              placeholder="Search merch, games, stories..."
              className="min-h-[48px] flex-1 rounded-full border border-white/10 bg-[#120d13]/82 px-5 text-sm text-[#fff7ef] outline-none transition placeholder:text-[#f8d8dd]/52 focus:border-[#f3b3c8]/60 focus:ring-2 focus:ring-[#f3b3c8]/25"
            />
            <button
              type="submit"
              className="min-h-[48px] rounded-full border border-[#ffe3ca]/40 bg-[#f0b2bf]/20 px-6 text-sm font-semibold text-[#fff4e8] transition hover:border-[#fff0d9]/65 hover:bg-[#f0b2bf]/28 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/35"
            >
              Search the grove
            </button>
          </form>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={paths.shop()}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#ffe3ca]/45 bg-[#f8bdc9]/22 px-6 text-sm font-semibold text-[#fff3e6] transition hover:border-[#fff1df]/70 hover:bg-[#f8bdc9]/30 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/35"
            >
              Visit the shop
            </Link>
            <Link
              href={paths.games()}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/14 bg-white/7 px-6 text-sm font-semibold text-white transition hover:border-[#f5c5d2]/35 hover:bg-white/11 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/25"
            >
              Play mini-games
            </Link>
            <Link
              href={paths.profile()}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/14 bg-white/7 px-6 text-sm font-semibold text-white transition hover:border-[#f5c5d2]/35 hover:bg-white/11 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/25"
            >
              Open profile
            </Link>
          </div>
        </div>

        <aside className="rounded-[1.8rem] border border-[#f6dcc7]/18 bg-[#09070c]/52 p-4 shadow-[0_26px_80px_rgba(0,0,0,0.36)] backdrop-blur-md sm:p-5 lg:mb-4">
          <div className="rounded-[1.35rem] border border-[#f6dcc7]/14 bg-[#150f14]/70 p-4">
            <p className="font-ui text-xs font-semibold uppercase tracking-[0.28em] text-[#f2bfd1]/80">
              Petal Pouch
            </p>
            <p className="font-display mt-2 text-2xl font-semibold text-[#fff4e8]">
              Petals start at the canopy.
            </p>
            <p className="font-body mt-3 text-sm leading-6 text-[#f7dcd5]/72">
              Earned petals, profile progress, and rewards stay on their owned routes. The homepage
              keeps the world visible without shortcutting auth or grant flows.
            </p>
            <Link
              href="/profile/petals"
              className="mt-4 inline-flex min-h-[44px] items-center rounded-full border border-[#f3b3c8]/24 bg-[#f3b3c8]/10 px-4 text-sm font-medium text-[#ffe9ef] transition hover:border-[#f3b3c8]/45 hover:bg-[#f3b3c8]/16 focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/25"
            >
              View petals
            </Link>
          </div>

          <nav aria-label="Homepage entry points" className="mt-4 grid gap-2">
            {entryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex min-h-[54px] items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] px-4 text-left transition hover:border-[#f3b3c8]/35 hover:bg-white/[0.075] focus:outline-none focus:ring-2 focus:ring-[#f3b3c8]/25"
              >
                <span>
                  <span className="block text-sm font-semibold text-[#fff4e8]">{link.label}</span>
                  <span className="block text-xs text-[#f7dcd5]/58">{link.description}</span>
                </span>
                <span className="text-[#f3b3c8]/70 transition group-hover:translate-x-0.5">
                  &rarr;
                </span>
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
