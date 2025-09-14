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
  // Optional typed source from API; when present we prefer this for grouping
  source?: 'site' | 'petal' | 'memory' | 'rhythm' | 'bubble' | 'puzzle' | string;
};

export default function AchievementsTabs({ achievements }: { achievements: Achievement[] }) {
  const [tab, setTab] = useState<'all' | 'site' | 'petal' | 'memory' | 'rhythm' | 'bubble' | 'puzzle'>('all');

  // Prefer typed source if present, otherwise use heuristics
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

  const TabBtn = ({ id, label }: { id: typeof tab; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className={[
        'px-3 py-1 rounded-full text-xs font-medium transition-colors',
        tab === id ? 'bg-pink-600 text-white' : 'bg-white/10 text-zinc-200 hover:bg-white/15',
      ].join(' ')}
      data-testid={`ach-tab-${id}`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <TabBtn id="all" label="All" />
        <TabBtn id="site" label="Site-wide" />
        <TabBtn id="petal" label="Petal Samurai" />
        <TabBtn id="memory" label="Memory Match" />
        <TabBtn id="rhythm" label="Rhythm Beat" />
        <TabBtn id="bubble" label="Bubble Girl" />
        <TabBtn id="puzzle" label="Puzzle Reveal" />
      </div>
      <AchievementsGrid achievements={current} />
    </div>
  );
}
