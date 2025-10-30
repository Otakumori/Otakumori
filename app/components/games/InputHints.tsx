'use client';

/**
 * Input hints overlay - Shows controls on first game load
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InputHintsProps {
  gameMode?: 'keyboard' | 'gamepad' | 'touch' | 'auto';
}

export function InputHints({ gameMode = 'auto' }: InputHintsProps) {
  const [visible, setVisible] = useState(false);
  const [detectedMode, setDetectedMode] = useState<'keyboard' | 'gamepad' | 'touch'>('keyboard');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem('om_input_tips_dismissed');
    if (dismissed === '1') {
      return;
    }

    // Detect input mode if auto
    if (gameMode === 'auto') {
      // Check for touch
      if ('ontouchstart' in window) {
        setDetectedMode('touch');
      }
      // Check for gamepad
      else if (navigator.getGamepads && navigator.getGamepads().length > 0) {
        setDetectedMode('gamepad');
      }
      // Default to keyboard
      else {
        setDetectedMode('keyboard');
      }
    } else {
      setDetectedMode(gameMode);
    }

    // Show after short delay
    setTimeout(() => setVisible(true), 1000);
  }, [gameMode]);

  const dismiss = () => {
    setVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('om_input_tips_dismissed', '1');
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-8 right-8 z-50 max-w-sm"
        >
          <div className="glass-panel rounded-2xl border border-white/20 bg-black/80 p-6 backdrop-blur-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Controls</h3>
              <button
                onClick={dismiss}
                className="text-zinc-400 transition-colors hover:text-white"
                aria-label="Dismiss hints"
              >
                ✕
              </button>
            </div>

            {detectedMode === 'keyboard' && <KeyboardHints />}
            {detectedMode === 'gamepad' && <GamepadHints />}
            {detectedMode === 'touch' && <TouchHints />}

            <button
              onClick={dismiss}
              className="mt-4 w-full rounded-lg bg-pink-500 py-2 font-medium text-white transition-colors hover:bg-pink-600"
            >
              Got it!
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function KeyboardHints() {
  return (
    <div className="space-y-2 text-sm text-zinc-300">
      <div className="flex items-center justify-between">
        <span>Move</span>
        <kbd className="rounded bg-white/10 px-2 py-1 font-mono">WASD / Arrows</kbd>
      </div>
      <div className="flex items-center justify-between">
        <span>Jump</span>
        <kbd className="rounded bg-white/10 px-2 py-1 font-mono">Space</kbd>
      </div>
      <div className="flex items-center justify-between">
        <span>Attack</span>
        <kbd className="rounded bg-white/10 px-2 py-1 font-mono">J</kbd>
      </div>
      <div className="flex items-center justify-between">
        <span>Dash</span>
        <kbd className="rounded bg-white/10 px-2 py-1 font-mono">K</kbd>
      </div>
      <div className="flex items-center justify-between">
        <span>Pause</span>
        <kbd className="rounded bg-white/10 px-2 py-1 font-mono">Esc</kbd>
      </div>
    </div>
  );
}

function GamepadHints() {
  return (
    <div className="space-y-2 text-sm text-zinc-300">
      <div className="flex items-center justify-between">
        <span>Move</span>
        <span className="text-zinc-400">Left Stick</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Jump</span>
        <span className="text-zinc-400">A Button</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Attack</span>
        <span className="text-zinc-400">X Button</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Dash</span>
        <span className="text-zinc-400">B Button</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Pause</span>
        <span className="text-zinc-400">Start</span>
      </div>
    </div>
  );
}

function TouchHints() {
  return (
    <div className="space-y-2 text-sm text-zinc-300">
      <p>Use on-screen controls:</p>
      <div className="flex items-center justify-between">
        <span>Virtual joystick</span>
        <span className="text-zinc-400">Left side</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Action buttons</span>
        <span className="text-zinc-400">Right side</span>
      </div>
    </div>
  );
}
