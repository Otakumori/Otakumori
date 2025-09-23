// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
// import Link from 'next/link';
import { COPY } from '../../lib/copy';
import GlassButton from '../../components/ui/GlassButton';
import GlassCard from '../../components/ui/GlassCard';

const Game = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">{COPY.loading.summon}</div>,
});

export default function PuzzleRevealPage() {
  const [mode, setMode] = useState<'classic' | 'blitz' | 'precision'>('classic');

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black">
      <div className="container mx-auto max-w-5xl p-4">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Puzzle Reveal</h1>
              <p className="text-zinc-300">{COPY.games.puzzleReveal}</p>
            </div>
            <GlassButton href="/mini-games" variant="secondary">
              {COPY.games.backToHub}
            </GlassButton>
          </div>

          {/* Game Mode Selection */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="mode-select" className="text-sm font-medium text-zinc-300">
                Mode:
              </label>
              <select
                id="mode-select"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'classic' | 'blitz' | 'precision')}
                className="px-3 py-1 text-sm bg-black/30 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label="Select game mode"
              >
                <option value="classic" className="bg-gray-800">
                  Classic (60s)
                </option>
                <option value="blitz" className="bg-gray-800">
                  Blitz (30s)
                </option>
                <option value="precision" className="bg-gray-800">
                  Precision (90s)
                </option>
              </select>
            </div>
          </div>
        </header>

        {/* Game Canvas */}
        <GlassCard className="overflow-hidden">
          <Game mode={mode} />
        </GlassCard>

        {/* Game Instructions */}
        <GlassCard className="mt-6 p-4">
          <h3 className="font-semibold text-white mb-2">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-zinc-200 mb-2">Brush Types:</h4>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>
                  • <span className="text-blue-500">Normal Brush</span> - Standard reveal power
                </li>
                <li>
                  • <span className="text-green-500">Wind Brush</span> - Wider area, weaker effect
                </li>
                <li>
                  • <span className="text-purple-500">Precision Brush</span> - Stronger, smaller
                  area
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-zinc-200 mb-2">Game Mechanics:</h4>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>• Energy bar limits brush usage</li>
                <li>• Fog regrows if untouched for 3+ seconds</li>
                <li>• Score based on % revealed + time bonus</li>
                <li>• Upgrade brushes with earned petals</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
