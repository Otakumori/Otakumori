import Head from 'next/head';
import Link from 'next/link';

export default function InsidersPage() {
  return (
    <main className="min-h-screen bg-[#080611] pt-24 text-zinc-100">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Insiders — Coming Soon</h1>
        <p className="mt-3 text-zinc-300">
          We’re polishing this feature. Check back soon or explore the shop and mini‑games.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Return Home
          </Link>
          <Link
            href="/mini-games"
            className="rounded-xl bg-fuchsia-500/90 px-4 py-2 text-sm text-white hover:bg-fuchsia-500"
          >
            Play a Game
          </Link>
        </div>
      </div>
    </main>
  );
}
