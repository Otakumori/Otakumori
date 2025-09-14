"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import GameCubeBoot from '@/app/components/GameCubeBoot';
import EnhancedLeaderboard from '@/app/components/EnhancedLeaderboard';

const games = [
  { slug: 'petal-collection', name: 'Petal Collection' },
  { slug: 'memory-match', name: 'Memory Match' },
  { slug: 'rhythm-beat-em-up', name: 'Rhythm Beat' },
  { slug: 'bubble-girl', name: 'Bubble Girl' },
  { slug: 'quick-math', name: 'Quick Math' },
  { slug: 'puzzle-reveal', name: 'Puzzle Reveal' },
];

export default function MiniGamesHome() {
  const [showBoot, setShowBoot] = useState(true);
  const [showLb, setShowLb] = useState(false);
  const [lbGame, setLbGame] = useState<string | null>(null);

  useEffect(() => {
    try {
      const seen = window.localStorage.getItem('gc_boot');
      if (seen === '1') setShowBoot(false);
    } catch {}
  }, []);

  if (showBoot) {
    return (
      <GameCubeBoot
        onBootComplete={() => {
          setShowBoot(false);
          try {
            window.localStorage.setItem('gc_boot', '1');
          } catch {}
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-white">Mini-Games</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <div key={g.slug} className="rounded-xl border border-white/10 bg-white/5 p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">{g.name}</span>
              <button
                onClick={() => { setLbGame(g.slug); setShowLb(true); }}
                className="text-xs rounded-md border border-white/15 px-2 py-1 hover:bg-white/10"
              >
                Leaderboard
              </button>
            </div>
            <Link href={`/mini-games/${g.slug}`} className="block text-sm text-pink-200 hover:text-pink-100">
              Play →
            </Link>
          </div>
        ))}
      </div>

      {showLb && lbGame && (
        <div className="fixed inset-0 z-40 flex">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowLb(false)}
            aria-label="Close leaderboard"
          />
          <div className="ml-auto h-full w-5/6 max-w-sm bg-white shadow-xl">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="text-sm font-semibold">Leaderboard · {lbGame.replace('-', ' ')}</div>
              <button className="text-sm" onClick={() => setShowLb(false)}>Close</button>
            </div>
            <div className="p-3 overflow-y-auto" style={{ height: 'calc(100% - 48px)' }}>
              <EnhancedLeaderboard gameCode={lbGame} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

