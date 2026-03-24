import { generateSEO } from '@/app/lib/seo';
import Link from 'next/link';

export const revalidate = 60;

export function generateMetadata() {
  return generateSEO({
    title: 'Welcome Home, Traveler — Otaku-mori',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/',
  });
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen z-10">
      <section className="relative z-40 mx-auto max-w-5xl px-4 py-16 md:py-24">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-8 md:p-12 backdrop-blur-sm">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-pink-200">
            Welcome Home, Traveler.
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-zinc-300">
            Otaku-mori is temporarily running on a lighter homepage while we rebuild the front page for performance and stability.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href="/shop"
              className="rounded-xl border border-pink-400/30 bg-pink-500/10 px-5 py-3 text-center font-medium text-pink-200 transition hover:bg-pink-500/20"
            >
              Enter Shop
            </Link>
            <Link
              href="/mini-games"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Mini-Games
            </Link>
            <Link
              href="/blog"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Blog
            </Link>
            <Link
              href="/community"
              className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-center font-medium text-zinc-200 transition hover:bg-white/10"
            >
              Community
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
