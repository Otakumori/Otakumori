'use client';

import { useState } from 'react';
import GameShell from '../_shared/GameShell';
import BeatEmUpGame from './BeatEmUpGame';
import { motion } from 'framer-motion';

type GameMode = 'story' | 'arcade' | 'survival';

export default function RhythmBeatEmUpPage() {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  if (selectedMode) {
    return (
      <GameShell title="Rhythm Beat-Em-Up" gameKey="rhythm-beat-em-up">
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 p-4">
          <div className="mb-4">
            <button
              onClick={() => setSelectedMode(null)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
            >
              ← Back to Mode Select
            </button>
          </div>
          <BeatEmUpGame mode={selectedMode} />
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell title="Rhythm Beat-Em-Up" gameKey="rhythm-beat-em-up">
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 p-8">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-5xl font-bold text-white mb-4">Rhythm Beat-Em-Up</h1>
            <p className="text-pink-200 text-xl mb-2">Sync to the Moon Prism's pulse.</p>
            <p className="text-sm text-pink-300 italic">
              "I didn't lose. Just ran out of health." – Edward Elric
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Story Mode */}
            <motion.button
              onClick={() => setSelectedMode('story')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-pink-500/50 rounded-2xl p-6 text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Story Mode</h2>
              <p className="text-pink-200 text-sm">
                Fight through waves of enemies and boss battles. Perfect for learning the rhythm
                mechanics.
              </p>
              <div className="mt-4 text-yellow-300 text-xs">
                • Progressive difficulty
                <br />
                • Boss encounters
                <br />• Unlockable characters
              </div>
            </motion.button>

            {/* Arcade Mode */}
            <motion.button
              onClick={() => setSelectedMode('arcade')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl p-6 text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Arcade Mode</h2>
              <p className="text-purple-200 text-sm">
                Classic beat-em-up action with rhythm scoring. Chain combos and maintain the beat!
              </p>
              <div className="mt-4 text-yellow-300 text-xs">
                • High score challenge
                <br />
                • Combo multipliers
                <br />• Leaderboards
              </div>
            </motion.button>

            {/* Survival Mode */}
            <motion.button
              onClick={() => setSelectedMode('survival')}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border-2 border-red-500/50 rounded-2xl p-6 text-white transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Survival Mode</h2>
              <p className="text-red-200 text-sm">
                Face endless waves of enemies. How long can you survive while staying on-beat?
              </p>
              <div className="mt-4 text-yellow-300 text-xs">
                • Endless waves
                <br />
                • Increasing difficulty
                <br />• Ultimate challenge
              </div>
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6"
          >
            <h3 className="text-white font-bold mb-3 text-center">How to Play</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-200">
              <div>
                <span className="text-pink-400 font-bold">WASD / Arrows:</span> Move your character
              </div>
              <div>
                <span className="text-pink-400 font-bold">Spacebar:</span> Attack (time with the
                beat!)
              </div>
              <div>
                <span className="text-purple-400 font-bold">Shift:</span> Block incoming attacks
              </div>
              <div>
                <span className="text-yellow-400 font-bold">Perfect Timing:</span> 2x damage
                multiplier
              </div>
            </div>
            <p className="text-center text-xs text-pink-300 mt-4">
              Attack in sync with the beat indicators at the top-right for maximum damage and combo
              bonuses!
            </p>
          </motion.div>
        </div>
      </div>
    </GameShell>
  );
}
