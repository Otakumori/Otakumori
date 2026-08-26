import Image from 'next/image';
import { loadAchievementsForProfile } from '../../profile/_data/achievements';

export default async function AchievementsPanel() {
  const { catalog, ownedSet, earnedPoints, totalPoints } = await loadAchievementsForProfile();

  return (
    <section aria-labelledby="achievements" className="mori-panel p-5">
      <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div>
          <h2 id="achievements" className="font-display text-lg font-semibold text-[#fff1e4]">
            Achievements
          </h2>
          <p className="mt-1 text-sm text-[#8f7f7d]">Relics earned across the world.</p>
        </div>
        <div className="text-sm text-[#c7a97f]">
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
                className="mori-achievement group relative flex items-center gap-3 p-3"
                data-locked={owned ? 'false' : 'true'}
              >
                <div className="mori-achievement-medallion relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={a.icon || '/placeholder-achievement.png'}
                    alt=""
                    fill
                    className={`object-contain p-2 ${owned ? '' : 'grayscale'}`}
                  />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-[#fff1e4]">
                    {a.title || a.name}
                  </div>
                  <div className="mt-0.5 text-xs text-[#a9855f]">{a.points} pts</div>
                </div>
                <div className="ml-auto text-[10px] uppercase tracking-[0.12em] text-[#8f7f7d]">
                  {owned ? 'Found' : 'Hidden'}
                </div>
                {a.lore && (
                  <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-72 -translate-x-1/2 rounded-lg border border-white/10 bg-[#090709]/95 p-3 text-xs leading-5 text-[#cdbbb7] shadow-2xl group-hover:block group-focus-within:block">
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
