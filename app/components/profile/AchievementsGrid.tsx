'use client';

import Image from 'next/image';
import GlassPanel from '../GlassPanel';

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
};

type AchievementsGridProps = {
  achievements: Achievement[];
};

const rarityLabels: Record<Achievement['rarity'], string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

function getCrypticHint(achievement: Achievement) {
  const hints = {
    'first-steps': 'A blossom unseen under moonlight',
    'petal-master': 'When the tree weeps, catch its tears',
    explorer: 'Venture where shadows dance',
    collector: 'Gather what others discard',
    'social-butterfly': 'Speak to the silent stones',
    'night-owl': 'When the world sleeps, you awaken',
    perfectionist: 'Seek the flawless path',
    mystic: 'Read the signs in the digital wind',
  };
  return hints[achievement.id as keyof typeof hints] || 'The path reveals itself to the patient';
}

export default function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage =
    totalCount > 0 ? Math.min(100, Math.max(0, Math.round((unlockedCount / totalCount) * 100))) : 0;

  return (
    <div className="space-y-7">
      <GlassPanel className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#fff1e4]">Collection progress</h2>
            <p className="mt-1 text-sm text-[#cdbbb7]">
              {unlockedCount} of {totalCount} relics discovered
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl font-semibold text-[#c7a97f]">{completionPercentage}%</div>
            <div className="text-xs uppercase tracking-[0.14em] text-[#8f7f7d]">complete</div>
          </div>
        </div>
        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#765f4b,#b69773,#d7b2b9)] transition-[width] duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </GlassPanel>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {achievements.map((achievement) => {
          const hint = achievement.unlocked ? achievement.description : getCrypticHint(achievement);
          const progress =
            achievement.progress !== undefined && achievement.maxProgress
              ? Math.min(100, Math.max(0, (achievement.progress / achievement.maxProgress) * 100))
              : null;

          return (
            <article
              key={achievement.id}
              className="mori-achievement p-4"
              data-rarity={achievement.rarity}
              data-locked={achievement.unlocked ? 'false' : 'true'}
            >
              <div className="flex items-start gap-4">
                <div className="mori-achievement-medallion relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full">
                  {achievement.unlocked ? (
                    <Image
                      src={`/assets/achievements/${achievement.icon}`}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 object-contain"
                    />
                  ) : (
                    <span aria-hidden="true" className="font-display text-xl text-[#8f7f7d]">
                      ?
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-base font-semibold text-[#fff1e4]">
                      {achievement.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-[0.13em] text-[#a9855f]">
                      {rarityLabels[achievement.rarity]}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#cdbbb7]/82">{hint}</p>
                </div>
              </div>

              {progress !== null && (
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-[#8f7f7d]">
                    <span>{achievement.unlocked ? 'Mastered' : 'Progress'}</span>
                    <span>
                      {achievement.progress} / {achievement.maxProgress}
                    </span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[#a9855f] transition-[width] duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 border-t border-white/[0.07] pt-3 text-xs text-[#8f7f7d]">
                {achievement.unlocked && achievement.unlockedAt
                  ? `Discovered ${new Date(achievement.unlockedAt).toLocaleDateString()}`
                  : achievement.unlocked
                    ? 'Discovered'
                    : 'Undiscovered'}
              </div>
            </article>
          );
        })}
      </div>

      {achievements.length === 0 && (
        <div className="mori-panel-soft px-6 py-12 text-center">
          <h2 className="font-display text-xl font-semibold text-[#fff1e4]">No relics discovered yet</h2>
          <p className="mt-2 text-sm text-[#cdbbb7]">Play, explore, and return when the first mark is earned.</p>
        </div>
      )}
    </div>
  );
}
