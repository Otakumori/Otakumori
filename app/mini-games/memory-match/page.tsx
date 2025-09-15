'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
// import Link from 'next/link';
import { COPY } from '../../lib/copy';
import GlassButton from '../../components/ui/GlassButton';
import GlassCard from '../../components/ui/GlassCard';
import BootScreen from '../../components/games/BootScreen';

const Game = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">{COPY.loading.summon}</div>,
});

export default function MemoryMatchPage() {
  const [mode, setMode] = useState<'classic' | 'daily' | 'challenge'>('classic');

  return (
    <BootScreen gameId="memory-match">
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100">
        <div className="container mx-auto max-w-5xl p-4">
          {/* Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Memory Match</h1>
                <p className="text-gray-600">{COPY.games.memoryMatch}</p>
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
                  onChange={(e) => setMode(e.target.value as 'classic' | 'daily' | 'challenge')}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                  aria-label="Select game mode"
                >
                  <option value="classic">Classic (2min)</option>
                  <option value="daily">Daily Challenge</option>
                  <option value="challenge">Speed Challenge (1min)</option>
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
                <h4 className="font-medium text-gray-800 mb-2">Game Rules:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click cards to flip them and find matching pairs</li>
                  <li>• Complete the board with the fewest moves possible</li>
                  <li>• Score based on speed and efficiency</li>
                  <li>• Perfect recall (no mistakes) gives bonus points</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Rune Sets:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>
                    • <span className="text-pink-500">Cherry Blossom</span> - Spring flowers
                    (common)
                  </li>
                  <li>
                    • <span className="text-blue-500">Eternal Rune</span> - Elemental forces (rare)
                  </li>
                  <li>
                    • <span className="text-purple-500">Guardian Rune</span> - Guardian symbols
                    (legendary)
                  </li>
                  <li>• Daily rotation keeps gameplay fresh</li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </div>
      </main>
    </BootScreen>
  );
}
