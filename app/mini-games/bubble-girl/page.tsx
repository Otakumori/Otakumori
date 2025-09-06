// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { COPY } from '@/app/lib/copy';
import Link from 'next/link';
// import GlassButton from '@/app/components/ui/GlassButton';
import GlassCard from '@/app/components/ui/GlassCard';

const Game = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">{COPY.loading.summon}</div>,
});

export default function BubbleGirlPage() {
  const [skin, setSkin] = useState('default');
  const [mode, setMode] = useState<'sandbox' | 'challenge'>('sandbox');

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-gray-50 to-pink-100">
      <div className="container mx-auto max-w-5xl p-4">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Bubble Girl</h1>
              <p className="text-gray-600">{COPY.games.bubbleGirl}</p>
            </div>
            <Link
              href="/mini-games"
              className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-700 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              {COPY.games.backToHub}
            </Link>
          </div>

          {/* Game Controls */}
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <label htmlFor="skin-select" className="text-sm font-medium text-gray-700">
                Character:
              </label>
              <select
                id="skin-select"
                value={skin}
                onChange={(e) => setSkin(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label="Select character skin"
              >
                <option value="default">Default</option>
                <option value="gym">Gym</option>
                <option value="festival">Festival</option>
                <option value="chibi">Chibi</option>
                <option value="armor">Armor</option>
                <option value="male-default">Male Default</option>
                <option value="male-gym">Male Gym</option>
                <option value="male-festival">Male Festival</option>
                <option value="male-chibi">Male Chibi</option>
                <option value="male-armor">Male Armor</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="mode-select" className="text-sm font-medium text-gray-700">
                Mode:
              </label>
              <select
                id="mode-select"
                value={mode}
                onChange={(e) => setMode(e.target.value as 'sandbox' | 'challenge')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label="Select game mode"
              >
                <option value="sandbox">Sandbox</option>
                <option value="challenge">Challenge (60s)</option>
              </select>
            </div>
          </div>
        </header>

        {/* Game Canvas */}
        <GlassCard className="overflow-hidden">
          <Game skin={skin} mode={mode} />
        </GlassCard>

        {/* Game Instructions */}
        <GlassCard className="mt-6 p-4">
          <h3 className="font-semibold text-gray-900 mb-2">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Controls:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Drag on limbs to nudge or toss the character</li>
                <li>• Toggle fans at screen edges for wind effects</li>
                <li>• Click to spawn new bubbles</li>
                <li>• Stay afloat in bubbles to score points</li>
                <li>• In challenge mode, survive for 60 seconds</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Bubble Types:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>
                  • <span className="text-blue-500">Normal Bubbles</span> - Standard floaty bubbles
                </li>
                <li>
                  • <span className="text-orange-500">Sticky Bubbles</span> - Grab limbs briefly
                </li>
                <li>
                  • <span className="text-red-500">Explosive Bubbles</span> - Small push force
                </li>
                <li>
                  • <span className="text-purple-500">Gigantic Bubbles</span> - Rare, carries
                  ragdoll upward
                </li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
