import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/15 via-card to-accent/10 ring-1 ring-white/5 p-8 md:p-12">
      <div className="max-w-2xl">
        <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-tight">
          Blossom your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            play
          </span>
          .
        </h1>
        <p className="mt-4 text-lg text-muted">
          Mini-games, avatars, and community quests—reimagined with polish.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/mini-games"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 ring-ring/50 bg-gradient-to-br from-primary to-accent text-white hover:opacity-90 shadow-brand"
          >
            Play now
          </Link>
          <Link
            href="/community"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 ring-ring/50 bg-transparent border border-white/10 hover:border-white/20"
          >
            Explore community
          </Link>
        </div>
      </div>

      {/* Decorative or dynamic visuals can layer here */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-accent/20 blur-2xl" />
    </section>
  );
}
