'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
// import Link from 'next/link';
import { COPY } from '@/app/lib/copy';
import GlassButton from '@/app/components/ui/GlassButton';
import GlassCard from '@/app/components/ui/GlassCard';

const Game = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">{COPY.loading.summon}</div>,
});

export default function PuzzleRevealPage() {
  const [mode, setMode] = useState<'classic' | 'blitz' | 'precision'>('classic');

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100">
      <div className="container mx-auto max-w-5xl p-4">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Puzzle Reveal</h1>
              <p className="text-gray-600">{COPY.games.puzzleReveal}</p>
            </div>
            <GlassButton href="/mini-games" variant="secondary">
              {COPY.games.backToHub}
            </GlassButton>
          </div>

          {/* Game Mode Selection */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="mode-select" className="text-sm font-medium text-gray-700">
                Mode:
              </label>
              <select
                id="mode-select"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'classic' | 'blitz' | 'precision')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label="Select game mode"
              >
                <option value="classic">Classic (60s)</option>
                <option value="blitz">Blitz (30s)</option>
                <option value="precision">Precision (90s)</option>
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
          <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Brush Types:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
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
              <h4 className="font-medium text-gray-800 mb-2">Game Mechanics:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
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
