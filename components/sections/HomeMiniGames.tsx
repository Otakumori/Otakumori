// components/sections/HomeMiniGames.tsx
type Game = { id: string; slug: string; title: string; image?: string; summary?: string };

async function fetchGames(): Promise<Game[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const urls = ['/api/games', '/api/mini-games', '/api/games/featured'];
  for (const url of urls) {
    const res = await fetch(`${base}${url}`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return (data.items ?? data.games ?? []).map((g: any) => ({
        id: String(g.id ?? g.slug),
        slug: g.slug ?? g.id,
        title: g.title ?? 'Mini-Game',
        image: g.image ?? g.thumbnail ?? undefined,
        summary: g.summary ?? g.description ?? undefined,
      }));
    }
  }
  throw new Error('no-games-api');
}

export default async function HomeMiniGames() {
  let games: Game[] = [];
  try {
    games = await fetchGames();
  } catch {}

  if (!games.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-pink-200">
        Jump into the mini-games hub.
        <a href="/mini-games" className="ml-2 underline decoration-pink-400 hover:opacity-90">
          Enter Mini-Games
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {games.slice(0, 6).map((g) => (
        <a
          key={g.id}
          href={`/mini-games/games/${g.slug}`}
          className="group rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition
                     overflow-hidden focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          <div className="relative aspect-[4/3] bg-black/30">
            {g.image ? <img src={g.image} alt="" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="p-4">
            <div className="font-semibold text-pink-100">{g.title}</div>
            {g.summary && <p className="mt-1 text-sm text-pink-200/80 line-clamp-2">{g.summary}</p>}
          </div>
        </a>
      ))}
    </div>
  );
}
