'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import GlassButton from '../../components/ui/GlassButton';
import GlassCard from '../../components/ui/GlassCard';

const InteractiveBuddyGame = dynamic(() => import('./InteractiveBuddyGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pink-200">Loading Interactive Buddy...</p>
      </div>
    </div>
  ),
});

type GameMode = 'sandbox' | 'stress-relief' | 'challenge';

export default function InteractiveBuddyPage() {
  const [mode, setMode] = useState<GameMode>('sandbox');
  const [key, setKey] = useState(0); // Force remount on mode change

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode);
    setKey((prev) => prev + 1); // Restart game with new mode
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-900 to-black p-4 page-transition">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Interactive Buddy
              </h1>
              <p className="text-zinc-300 font-medium">
                Physics-based character interaction. Click, drag, and use tools for satisfying ragdoll
                mayhem!
              </p>
            </div>
            <a href="/mini-games">
              <GlassButton variant="secondary">⟵ Back to Hub</GlassButton>
            </a>
          </div>

          {/* Mode Selection */}
          <div className="flex flex-wrap gap-3">
            {(['sandbox', 'stress-relief', 'challenge'] as GameMode[]).map((gameMode) => (
              <button
                key={gameMode}
                onClick={() => handleModeChange(gameMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                  mode === gameMode
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50'
                    : 'bg-black/30 border border-white/20 text-zinc-300 hover:bg-black/50 hover:border-white/40'
                }`}
              >
                {gameMode === 'sandbox' && 'Sandbox (Unlimited Money)'}
                {gameMode === 'stress-relief' && 'Stress Relief (Destructive Tools)'}
                {gameMode === 'challenge' && 'Challenge (Earn Money)'}
              </button>
            ))}
          </div>
        </header>

        {/* Game Canvas */}
        <GlassCard className="overflow-hidden p-4">
          <InteractiveBuddyGame key={key} mode={mode} />
        </GlassCard>

        {/* Game Instructions */}
        <GlassCard className="mt-6 p-6">
          <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">ℹ</span> How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-pink-300 mb-3 text-lg">Controls</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>
                    <strong>Click:</strong> Use selected tool on character
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>
                    <strong>Click + Drag:</strong> Grab and throw character parts
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>
                    <strong>Tool Selection:</strong> Click tools in the panel to equip
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5">•</span>
                  <span>
                    <strong>Reset:</strong> Click reset button to restore character
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-purple-300 mb-3 text-lg">Tool Types</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-red-400">Destructive:</strong> Deal damage with satisfying
                    physics (slap, punch, bat, bomb, laser)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-green-400">Healing:</strong> Restore health with gentle
                    interactions (compliment, head pat)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong className="text-blue-400">Fun:</strong> Interactive effects and physics
                    modifiers (poke, tickle, gravity, wind)
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-blue-300 mb-3 text-lg">Game Modes</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong>Sandbox:</strong> Unlimited money, all tools available, pure experimentation
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong>Stress Relief:</strong> Focus on destructive tools for satisfying stress
                    release
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>
                    <strong>Challenge:</strong> Earn money by interacting, buy better tools, maximize
                    score
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-yellow-300 mb-3 text-lg">Scoring System</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Score increases based on tool damage and effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Build combos with rapid successive hits (up to 5x multiplier)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Earn money to unlock more powerful tools</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 mt-0.5">•</span>
                  <span>Realistic ragdoll physics with satisfying particle effects</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <h4 className="font-medium text-purple-300 mb-2 text-lg">Pro Tips</h4>
            <ul className="text-sm text-zinc-300 space-y-1">
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span>Drag the character high and drop for maximum physics impact</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span>Combine tools in quick succession to build your combo multiplier</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span>
                  Use healing tools strategically in Challenge mode to keep the character alive longer
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-400">→</span>
                <span>Experiment with gravity and wind tools for creative physics interactions</span>
              </li>
            </ul>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}
