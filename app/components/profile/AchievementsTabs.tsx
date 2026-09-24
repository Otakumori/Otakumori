'use client';

import { useMemo, useState } from 'react';
import AchievementsGrid from './AchievementsGrid';

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
  source?: 'site' | 'petal' | 'memory' | 'rhythm' | 'bubble' | 'puzzle' | string;
};

export default function AchievementsTabs({ achievements }: { achievements: Achievement[] }) {
  const [tab, setTab] = useState<
    'all' | 'site' | 'petal' | 'memory' | 'rhythm' | 'bubble' | 'puzzle'
  >('all');

  const groups = useMemo(() => {
    const site: Achievement[] = [];
    const petal: Achievement[] = [];
    const memory: Achievement[] = [];
    const rhythm: Achievement[] = [];
    const bubble: Achievement[] = [];
    const puzzle: Achievement[] = [];
    for (const a of achievements) {
      const src = (a.source || '').toLowerCase();
      if (src) {
        if (src.startsWith('petal')) petal.push(a);
        else if (src.startsWith('memory')) memory.push(a);
        else if (src.startsWith('rhythm')) rhythm.push(a);
        else if (src.startsWith('bubble')) bubble.push(a);
        else if (src.startsWith('puzzle')) puzzle.push(a);
        else site.push(a);
      } else {
        const nid = (a.id + ' ' + a.name + ' ' + a.description).toLowerCase();
        if (nid.includes('petal') || nid.includes('samurai')) petal.push(a);
        else if (nid.includes('memory')) memory.push(a);
        else if (nid.includes('rhythm') || nid.includes('beat')) rhythm.push(a);
        else if (nid.includes('bubble')) bubble.push(a);
        else if (nid.includes('puzzle') || nid.includes('reveal')) puzzle.push(a);
        else site.push(a);
      }
    }
    return { site, petal, memory, rhythm, bubble, puzzle };
  }, [achievements]);

  const current = useMemo(() => {
    switch (tab) {
      case 'site':
        return groups.site;
      case 'petal':
        return groups.petal;
      case 'memory':
        return groups.memory;
      case 'rhythm':
        return groups.rhythm;
      case 'bubble':
        return groups.bubble;
      case 'puzzle':
        return groups.puzzle;
      default:
        return achievements;
    }
  }, [tab, achievements, groups]);

  const tabs: Array<{ id: typeof tab; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'site', label: 'Site-wide' },
    { id: 'petal', label: 'Petal Samurai' },
    { id: 'memory', label: 'Memory Match' },
    { id: 'rhythm', label: 'Rhythm Beat' },
    { id: 'bubble', label: 'Bubble Ragdoll' },
    { id: 'puzzle', label: 'Puzzle Reveal' },
  ];

  return (
    <div className="space-y-6">
      <div
        className="flex gap-1 overflow-x-auto border-b border-white/10 pb-3"
        role="tablist"
        aria-label="Achievement collection filters"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-medium transition-colors ${
              tab === item.id
                ? 'border border-[#c7a97f]/30 bg-[#a9855f]/15 text-[#fff1e4]'
                : 'border border-transparent text-[#cdbbb7] hover:border-white/10 hover:bg-white/[0.035] hover:text-white'
            }`}
            data-testid={`ach-tab-${item.id}`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <AchievementsGrid achievements={current} />
    </div>
  );
}
