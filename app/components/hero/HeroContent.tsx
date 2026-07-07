'use client';

export default function HeroContent() {
  return (
    <div className="relative z-20 flex min-h-[100svh] items-center justify-center px-4 text-center">
      <div className="max-w-3xl rounded-[2rem] border border-pink-100/14 bg-[#080611]/34 px-5 py-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:px-10">
        <p className="font-ui text-xs font-semibold uppercase tracking-[0.34em] text-pink-100/75">
          Welcome, traveler
        </p>

        <h1 className="font-display mt-4 text-balance text-5xl font-semibold tracking-tight text-[#f7eadf] md:text-7xl">
          Rest beneath the sakura tree
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#f5d6dc]/76 md:text-lg">
          Shop, play, and build your traveler identity inside a soft dark fantasy grove made for
          anime, games, and careful little rituals.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="/shop"
            className="min-h-[44px] rounded-full border border-pink-100/30 bg-pink-300/16 px-6 py-3 text-sm font-semibold text-pink-50 transition hover:border-pink-100/55 hover:bg-pink-300/24"
          >
            Visit the Shop
          </a>

          <a
            href="/mini-games"
            className="min-h-[44px] rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:border-pink-100/30 hover:bg-white/10"
          >
            Play Mini-Games
          </a>

          <a
            href="/community"
            className="min-h-[44px] rounded-full border border-white/12 bg-white/6 px-6 py-3 text-sm font-semibold text-white transition hover:border-pink-100/30 hover:bg-white/10"
          >
            Join the Community
          </a>
        </div>
      </div>
    </div>
  );
}
