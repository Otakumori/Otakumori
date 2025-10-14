'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ControlMapping {
  key: string;
  action: string;
  icon?: string;
}

interface GameControlsProps {
  game: string;
  controls: ControlMapping[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showOnMount?: boolean;
  autoHideDelay?: number; // milliseconds, 0 means never hide
}

export default function GameControls({
  game,
  controls,
  position = 'bottom-right',
  showOnMount = true,
  autoHideDelay = 5000,
}: GameControlsProps) {
  const [isVisible, setIsVisible] = useState(showOnMount);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (autoHideDelay > 0 && isVisible) {
      const timer = setTimeout(() => {
        setIsExpanded(false);
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHideDelay, isVisible]);

  // Auto-expand on mount
  useEffect(() => {
    if (showOnMount) {
      setIsExpanded(true);
    }
  }, [showOnMount]);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-40`}>
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="bg-black/80 backdrop-blur-md border border-pink-500/30 rounded-2xl p-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-pink-200 font-semibold text-sm flex items-center gap-2">
                <span className="text-pink-400">🎮</span>
                {game} Controls
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/50 hover:text-white/80 transition-colors text-xs"
                aria-label="Minimize controls"
              >
                ✕
              </button>
            </div>

            {/* Controls List */}
            <div className="space-y-2">
              {controls.map((control, index) => (
                <div key={index} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-white/70">{control.action}</span>
                  <kbd className="px-3 py-1 bg-gradient-to-br from-pink-600 to-pink-700 text-white font-mono text-xs rounded-lg shadow-lg border border-pink-400/30 min-w-[3rem] text-center">
                    {control.icon || control.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-white/40 text-xs text-center">
                Press <kbd className="px-1 bg-white/10 rounded">?</kbd> to toggle
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className="bg-black/60 backdrop-blur-sm border border-pink-500/30 rounded-full p-3 shadow-lg hover:bg-black/80 hover:scale-110 transition-all"
            aria-label="Show controls"
          >
            <span className="text-2xl">🎮</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Preset control configurations for common games
export const CONTROL_PRESETS = {
  'petal-samurai': [
    { key: 'Mouse', action: 'Slash Petals', icon: '🖱️' },
    { key: 'Click + Drag', action: 'Draw Slash Trail' },
    { key: 'ESC', action: 'Pause Game' },
  ],
  'memory-match': [
    { key: 'Click', action: 'Flip Card', icon: '🖱️' },
    { key: 'Arrow Keys', action: 'Navigate Cards', icon: '⬆️⬇️⬅️➡️' },
    { key: 'SPACE', action: 'Select Card' },
    { key: 'ESC', action: 'Return to Menu' },
  ],
  'bubble-girl': [
    { key: 'Click', action: 'Spawn Bubble', icon: '🖱️' },
    { key: 'Click + Drag', action: 'Move Character' },
    { key: '1-9', action: 'Select Tool' },
    { key: 'ESC', action: 'Pause' },
  ],
  'dungeon-of-desire': [
    { key: '← →', action: 'Move Left/Right', icon: '⬅️➡️' },
    { key: 'SPACE', action: 'Jump' },
    { key: '↑', action: 'Enter Door', icon: '⬆️' },
    { key: '↓', action: 'Crouch', icon: '⬇️' },
    { key: 'ESC', action: 'Pause' },
  ],
  'petal-storm-rhythm': [
    { key: 'D F J K', action: 'Hit Notes' },
    { key: 'SPACE', action: 'Special' },
    { key: 'ESC', action: 'Pause' },
  ],
  'puzzle-reveal': [
    { key: 'Click', action: 'Reveal Tile', icon: '🖱️' },
    { key: 'Fast Clicks', action: 'Build Combo (10x max)', icon: '⚡' },
    { key: 'ESC', action: 'Pause Game' },
  ],
  'thigh-coliseum': [
    { key: 'Click', action: 'Select Option', icon: '🖱️' },
    { key: '1-4', action: 'Quick Select' },
    { key: 'SPACE', action: 'Continue' },
  ],
  blossomware: [
    { key: 'Varies', action: 'Each Micro-Game', icon: '🎮' },
    { key: 'ESC', action: 'Skip Game' },
  ],
} as const;
