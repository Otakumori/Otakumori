'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import GlassButton from '../../components/ui/GlassButton';
import GlassCard from '../../components/ui/GlassCard';

const EnhancedTileGame = dynamic(() => import('./EnhancedTileGame'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pink-200">Loading artwork...</p>
      </div>
    </div>
  ),
});

type GameMode = 'easy' | 'medium' | 'hard' | 'expert';

export default function PuzzleRevealPage() {
  const [mode, setMode] = useState<GameMode>('medium');
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
                ð¨ Puzzle Reveal
              </h1>
              <p className="text-zinc-300 font-medium">
                Click tiles to reveal breathtaking artwork. Fast clicks build combos!
              </p>
            </div>
            <a href="/mini-games">
              <GlassButton variant="secondary">âµ Back to Hub</GlassButton>
            </a>
          </div>

          {/* Difficulty Selection */}
          <div className="flex flex-wrap gap-3">
            {(['easy', 'medium', 'hard', 'expert'] as GameMode[]).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => handleModeChange(difficulty)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  mode === difficulty
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/50'
                    : 'bg-black/30 border border-white/20 text-zinc-300 hover:bg-black/50 hover:border-white/40'
                }`}
              >
                {difficulty === 'easy' && 'ð¢ Easy (4Ã3)'}
                {difficulty === 'medium' && 'ð¡ Medium (6Ã5)'}
                {difficulty === 'hard' && 'ð  Hard (8Ã6)'}
                {difficulty === 'expert' && 'ð´ Expert (10Ã8)'}
              </button>
            ))}
          </div>
        </header>

        {/* Game Canvas */}
        <GlassCard className="overflow-hidden p-4">
          <EnhancedTileGame key={key} mode={mode} />
        </GlassCard>

        {/* Game Instructions */}
        <GlassCard className="mt-6 p-6">
          <h3 className="font-semibold text-white text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">â¹ï¸</span> How to Play
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-pink-300 mb-3 text-lg">Objective</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Click tiles to reveal the hidden artwork beneath</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Reveal all tiles to complete the puzzle</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Higher difficulties have more tiles and better rewards</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-purple-300 mb-3 text-lg">Combo System</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5" aria-hidden="true">*</span>
                  <span>
                    Click tiles quickly (within 0.5s) to build a <strong>combo multiplier</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Each combo level adds +50 bonus points per tile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Max combo: 10x for massive score boosts!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Combo resets if you wait too long between clicks</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-300 mb-3 text-lg">Scoring</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Base score: 100 points per tile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Combo bonus: Up to +500 points per tile (10x combo)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Speed bonus: Complete faster for extra points</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-green-300 mb-3 text-lg">Rewards</h4>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Earn petals based on your final score</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Higher difficulties mean more petals per point</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5" aria-hidden="true">*</span>
                  <span>Finish quickly with high combos to maximize rewards</span>
                </li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}


