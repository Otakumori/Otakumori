import GlassPanel from './GlassPanel';
import Link from 'next/link';
import { t } from '@/lib/microcopy';
import { env } from '@/server/env';

type Game = { id: string; slug: string; title: string; summary?: string };

async function getGames(): Promise<Game[]> {
  const baseUrl = env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/v1/games/teaser?limit=3`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return (await res.json()) as Game[];
}

export default async function MiniGameTeaser() {
  const games = await getGames();
  if (!games.length) return null;

  return (
    <section id="games" className="relative z-10 mx-auto mt-10 max-w-7xl px-4 md:mt-14 md:px-6">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-xl font-semibold text-fuchsia-100 md:text-2xl">{t("nav", "miniGames")}</h2>
        <Link href="/games" className="text-sm text-fuchsia-300 hover:text-fuchsia-200">{t("cta", "download3")}</Link>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {games.map((g) => (
          <GlassPanel key={g.id} className="p-4">
            <Link href={`/games/${g.slug}`} className="block">
              <h3 className="text-base font-semibold text-white">{g.title}</h3>
              {g.summary ? <p className="mt-2 line-clamp-3 text-sm text-zinc-300/90">{g.summary}</p> : null}
            </Link>
          </GlassPanel>
        ))}
      </div>
    </section>
  );
}
