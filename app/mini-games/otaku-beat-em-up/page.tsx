'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import GameShell from '../_shared/GameShell';
import BeatEmUpGame from './BeatEmUpGame';
import { motion } from 'framer-motion';
import { useGameAvatar } from '../_shared/useGameAvatarWithConfig';
import { AvatarRenderer } from '@om/avatar-engine/renderer';
import { GameHUD } from '../_shared/GameHUD';
import { AvatarPresetChoice, type AvatarChoice } from '../_shared/AvatarPresetChoice';
import { getGameAvatarUsage } from '../_shared/miniGameConfigs';
import { isAvatarsEnabled } from '@om/avatar-engine/config/flags';
import type { AvatarProfile } from '@om/avatar-engine/types/avatar';

type GameMode = 'story' | 'arcade' | 'survival';

export default function RhythmBeatEmUpPage() {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  
  // Avatar choice state
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarProfile | null>(null);
  const [showAvatarChoice, setShowAvatarChoice] = useState(false);
  
  // Avatar integration - use wrapper hook with choice
  const avatarUsage = getGameAvatarUsage('otaku-beat-em-up');
  const { avatarConfig, representationConfig, isLoading: avatarLoading } = useGameAvatar('otaku-beat-em-up', {
    forcePreset: avatarChoice === 'preset',
    avatarProfile: avatarChoice === 'avatar' ? selectedAvatar : null,
  });
  
  // Handle avatar choice
  const handleAvatarChoice = useCallback((choice: AvatarChoice, avatar?: AvatarProfile) => {
    setAvatarChoice(choice);
    if (choice === 'avatar' && avatar) {
      setSelectedAvatar(avatar);
    }
    setShowAvatarChoice(false);
  }, []);

  if (selectedMode) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between">
          <Link
            href="/mini-games"
            className="px-4 py-2 rounded-lg bg-black/50 backdrop-blur border border-pink-500/30 text-pink-200 hover:bg-pink-500/20 transition-colors"
          >
            Back to Arcade
          </Link>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-pink-200">Rhythm Beat-Em-Up</h1>
            <p className="text-sm text-pink-200/70">Sync to the Moon Prism's pulse</p>
          </div>
          <div className="w-24" /> {/* Spacer */}
        </div>

        {/* Avatar vs Preset Choice */}
        {showAvatarChoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <AvatarPresetChoice
              gameId="otaku-beat-em-up"
              onChoice={handleAvatarChoice}
              onCancel={() => setShowAvatarChoice(false)}
            />
          </div>
        )}

        {/* Avatar Display (FullBody Mode) */}
        {!showAvatarChoice && isAvatarsEnabled() && avatarConfig && !avatarLoading && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30">
            <AvatarRenderer
              profile={avatarConfig}
              mode={representationConfig.mode}
              size="small"
            />
          </div>
        )}

        {/* Game HUD */}
        <GameHUD
          score={score}
          health={health}
          maxHealth={100}
          combo={combo}
        />

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
            <BeatEmUpGame mode={selectedMode} onScoreChange={setScore} onHealthChange={setHealth} onComboChange={setCombo} />
          </div>
        </GameShell>
      </div>
    );
  }

  return (
    <GameShell title="Rhythm Beat-Em-Up" gameKey="rhythm-beat-em-up">
      {/* Avatar vs Preset Choice */}
      {showAvatarChoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <AvatarPresetChoice
            gameId="otaku-beat-em-up"
            onChoice={handleAvatarChoice}
            onCancel={() => setShowAvatarChoice(false)}
          />
        </div>
      )}
      
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
              onClick={() => {
                if (avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled()) {
                  setShowAvatarChoice(true);
                } else {
                  setSelectedMode('story');
                }
              }}
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
              onClick={() => {
                if (avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled()) {
                  setShowAvatarChoice(true);
                } else {
                  setSelectedMode('arcade');
                }
              }}
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
              onClick={() => {
                if (avatarUsage === 'avatar-or-preset' && avatarChoice === null && isAvatarsEnabled()) {
                  setShowAvatarChoice(true);
                } else {
                  setSelectedMode('survival');
                }
              }}
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
