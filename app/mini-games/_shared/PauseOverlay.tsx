'use client';

import { motion } from 'framer-motion';
import { Play, Settings, Home, Trophy } from 'lucide-react';

interface PauseOverlayProps {
  gameKey: string;
  onResume: () => void;
  onQuit: () => void;
  onShowControls?: () => void;
  theme?: {
    accent: string;
    overlayBg: string;
  };
}

// Game-specific theme tokens
const GAME_THEMES = {
  'samurai-petal-slice': {
    accent: '#ff6b6b',
    overlayBg: 'rgba(220, 38, 38, 0.1)',
    title: 'Samurai Slice',
    description: 'Master the blade, collect the petals',
  },
  'memory-match': {
    accent: '#4ecdc4',
    overlayBg: 'rgba(78, 205, 196, 0.1)',
    title: 'Memory Match',
    description: 'Recall the faces bound by fate',
  },
  'bubble-ragdoll': {
    accent: '#45b7d1',
    overlayBg: 'rgba(69, 183, 209, 0.1)',
    title: 'Bubble Ragdoll',
    description: 'Pop for spy-craft secrets',
  },
  'rhythm-beat-em-up': {
    accent: '#96ceb4',
    overlayBg: 'rgba(150, 206, 180, 0.1)',
    title: 'Rhythm Beat-Em-Up',
    description: "Sync to the Moon Prism's pulse",
  },
  'quick-math': {
    accent: '#feca57',
    overlayBg: 'rgba(254, 202, 87, 0.1)',
    title: 'Quick Math',
    description: 'Solve equations under pressure',
  },
  'petal-collection': {
    accent: '#ff9ff3',
    overlayBg: 'rgba(255, 159, 243, 0.1)',
    title: 'Petal Collection',
    description: 'Gather the fallen blossoms',
  },
};

export default function PauseOverlay({
  gameKey,
  onResume,
  onQuit,
  onShowControls,
  theme,
}: PauseOverlayProps) {
  const gameTheme = GAME_THEMES[gameKey as keyof typeof GAME_THEMES] || {
    accent: '#ffb7c5',
    overlayBg: 'rgba(255, 183, 197, 0.1)',
    title: 'Game Paused',
    description: 'Take a moment to breathe',
  };

  const finalTheme = theme || gameTheme;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center"
      style={{ background: finalTheme.overlayBg }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative rounded-2xl border p-8 max-w-md w-full mx-4"
        style={{
          borderColor: finalTheme.accent,
          background: 'rgba(0,0,0,0.85)',
          boxShadow: `0 0 32px ${finalTheme.accent}40`,
        }}
      >
        {/* Game Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2" style={{ color: finalTheme.accent }}>
            {gameTheme.title}
          </h2>
          <p className="text-neutral-300 text-sm">{gameTheme.description}</p>
        </div>

        {/* Pause Status */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800/50 border border-neutral-700">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-neutral-300 text-sm">PAUSED</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: finalTheme.accent,
              color: '#000',
              boxShadow: `0 4px 16px ${finalTheme.accent}40`,
            }}
          >
            <Play className="h-5 w-5" />
            Resume Game
          </button>

          {onShowControls && (
            <button
              onClick={onShowControls}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 border border-neutral-600 bg-neutral-800/50 text-neutral-200 hover:bg-neutral-700/50"
            >
              <Settings className="h-5 w-5" />
              Controls
            </button>
          )}

          <button
            onClick={onQuit}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 border border-neutral-600 bg-neutral-800/50 text-neutral-200 hover:bg-neutral-700/50"
          >
            <Home className="h-5 w-5" />
            Return to Hub
          </button>
        </div>

        {/* Game Stats Preview */}
        <div className="mt-6 p-4 rounded-lg bg-neutral-800/30 border border-neutral-700">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium text-neutral-200">Current Session</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-neutral-400">
            <div>
              <div>Time Played</div>
              <div className="text-neutral-200 font-medium">--:--</div>
            </div>
            <div>
              <div>Best Score</div>
              <div className="text-neutral-200 font-medium">--</div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="mt-4 text-center">
          <div className="text-xs text-neutral-500">
            <span className="inline-block px-2 py-1 rounded bg-neutral-800/50 border border-neutral-700 mr-2">
              ESC
            </span>
            Pause/Resume
            <span className="inline-block px-2 py-1 rounded bg-neutral-800/50 border border-neutral-700 ml-2 mr-2">
              H
            </span>
            Return to Hub
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
