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

export default function PetalSamuraiPage() {
  const [mode, setMode] = useState<'classic' | 'storm' | 'endless'>('classic');

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100">
      <div className="container mx-auto max-w-5xl p-4">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Petal Samurai</h1>
              <p className="text-gray-600">{COPY.games.petalSamurai}</p>
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
                onChange={(e) => setMode(e.target.value as 'classic' | 'storm' | 'endless')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label="Select game mode"
              >
                <option value="classic">Classic (60s)</option>
                <option value="storm">Storm Mode</option>
                <option value="endless">Endless</option>
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
              <h4 className="font-medium text-gray-800 mb-2">Petal Types:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <span className="text-pink-500">Pink Petals</span> - 1 point each
                </li>
                <li>
                  • <span className="text-yellow-500">Gold Petals</span> - 5 points, rare spawn
                </li>
                <li>
                  • <span className="text-red-500">Cursed Petals</span> - -2 points, stuns you!
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Combo System:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Chain hits to build combo multiplier</li>
                <li>• Miss three petals and the round ends</li>
                <li>• Speed increases every 20 seconds</li>
                <li>• Storm mode activates after 60 seconds</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
