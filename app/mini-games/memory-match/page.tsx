'use client';

import { useState } from 'react';
import { type Metadata } from 'next';
import GameShell from '../_shared/GameShell';
import MemoryMatchGame from './MemoryMatchGame';

export default function MemoryMatchPage() {
  const [deck, setDeck] = useState<'anime' | 'gaming' | 'runes'>('anime');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const deckOptions = {
    anime: {
      name: 'Anime Faces',
      description: 'Recall the faces bound by fate',
      pairs: 8,
      theme: 'from-purple-900 to-indigo-900',
    },
    gaming: {
      name: 'Gaming Icons',
      description: 'Console classics and modern symbols',
      pairs: 8,
      theme: 'from-blue-900 to-purple-900',
    },
    runes: {
      name: 'Mystic Runes',
      description: 'Ancient symbols of power',
      pairs: 8,
      theme: 'from-pink-900 to-purple-900',
    },
  };

  const difficultyOptions = {
    easy: { pairs: 6, time: 180 }, // 3x4 grid, 3 minutes
    medium: { pairs: 8, time: 120 }, // 4x4 grid, 2 minutes
    hard: { pairs: 12, time: 90 }, // 4x6 grid, 1.5 minutes
  };

  return (
    <GameShell title="Memory Match" gameKey="memory-match">
      <div className={`w-full h-full bg-gradient-to-br ${deckOptions[deck].theme} relative`}>
        {/* Dark glass container */}
        <div className="h-full bg-black/20 backdrop-blur-sm border border-white/10">
          <div className="p-6 h-full flex flex-col">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Memory Match</h1>
              <p className="text-gray-300">{deckOptions[deck].description}</p>
            </div>

            {/* Game Settings */}
            <div className="mb-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-300">Deck:</label>
                <select
                  value={deck}
                  onChange={(e) => setDeck(e.target.value as any)}
                  className="px-3 py-1 text-sm bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-500"
                >
                  {Object.entries(deckOptions).map(([key, option]) => (
                    <option key={key} value={key} className="bg-gray-800">
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-300">Difficulty:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="px-3 py-1 text-sm bg-black/30 border border-white/20 rounded-lg text-white focus:outline-none focus:border-pink-500"
                >
                  <option value="easy" className="bg-gray-800">
                    Easy (6 pairs)
                  </option>
                  <option value="medium" className="bg-gray-800">
                    Medium (8 pairs)
                  </option>
                  <option value="hard" className="bg-gray-800">
                    Hard (12 pairs)
                  </option>
                </select>
              </div>
            </div>

            {/* Game Container */}
            <div className="flex-1 bg-black/10 rounded-2xl border border-white/10 overflow-hidden">
              <MemoryMatchGame
                deck={deck}
                pairs={difficultyOptions[difficulty].pairs}
                timeLimit={difficultyOptions[difficulty].time}
              />
            </div>

            {/* Instructions */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="bg-black/20 rounded-lg p-3">
                <h4 className="font-medium text-white mb-2">How to Play:</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• Click cards to flip and find matching pairs</li>
                  <li>• Complete before time runs out</li>
                  <li>• Fewer moves = higher score</li>
                  <li>• Perfect runs get bonus points</li>
                </ul>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <h4 className="font-medium text-white mb-2">Card Themes:</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>
                    • <span className="text-purple-400">Anime</span> - Character faces
                  </li>
                  <li>
                    • <span className="text-blue-400">Gaming</span> - Console icons
                  </li>
                  <li>
                    • <span className="text-pink-400">Runes</span> - Mystic symbols
                  </li>
                  <li>• Custom Otaku-mori card backs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GameShell>
  );
}
