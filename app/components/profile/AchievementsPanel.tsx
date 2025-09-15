import Image from 'next/image';
import { loadAchievementsForProfile } from '../../profile/_data/achievements';

export default async function AchievementsPanel() {
  const { catalog, ownedSet, earnedPoints, totalPoints } = await loadAchievementsForProfile();

  return (
    <section
      aria-labelledby="achievements"
      className="rounded-2xl border border-white/10 bg-black/50 p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 id="achievements" className="text-lg font-semibold text-white">
          Achievements
        </h2>
        <div className="text-sm text-zinc-300">
          {earnedPoints}/{totalPoints} pts
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map(
          (a: {
            code: string;
            name: string;
            description: string;
            points: number;
            icon?: string;
            title?: string;
            lore?: string;
          }) => {
            const owned = ownedSet.has(a.code);
            return (
              <div
                key={a.code}
                className={`group relative flex items-center gap-3 rounded-xl border p-3 transition
                ${owned ? 'border-white/12 bg-black/60' : 'border-white/5 bg-black/40 opacity-70'}`}
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-lg ring-1 ring-white/10">
                  <Image
                    src={a.icon || '/placeholder-achievement.png'}
                    alt=""
                    fill
                    className={`object-contain ${owned ? '' : 'grayscale'}`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">
                    {a.title || a.name}
                  </div>
                  <div className="truncate text-xs text-zinc-300">{a.points} pts</div>
                </div>
                <div className="ml-auto rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] font-semibold text-zinc-200">
                  {owned ? 'Unlocked' : 'Locked'}
                </div>
                {/* lore */}
                {a.lore && (
                  <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-80 -translate-x-1/2 rounded-lg border border-white/10 bg-black/90 p-3 text-xs text-zinc-300 shadow-2xl group-hover:block">
                    {a.lore}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>
    </section>
  );
}
