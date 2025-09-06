'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ControlHint {
  key: string;
  action: string;
  description?: string;
}

interface ControlsProps {
  title?: string;
  hints: ControlHint[];
  className?: string;
}

export default function Controls({ title = 'Controls', hints, className = '' }: ControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Controls Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-neutral-900/80 hover:bg-neutral-800/90 text-white px-4 py-2 rounded-lg border border-neutral-700 backdrop-blur-sm transition-colors"
        aria-label="Show controls"
      >
        🎮 {title}
      </button>

      {/* Controls Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full right-0 mb-2 w-80 bg-neutral-900/95 border border-neutral-700 rounded-lg p-4 backdrop-blur-sm shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
                aria-label="Close controls"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {hints.map((hint, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <kbd className="px-2 py-1 bg-neutral-800 text-neutral-200 rounded border border-neutral-600 font-mono text-xs min-w-[2rem] text-center">
                    {hint.key}
                  </kbd>
                  <span className="text-neutral-300 font-medium">{hint.action}</span>
                  {hint.description && (
                    <span className="text-neutral-500 text-xs ml-auto">{hint.description}</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-700 text-xs text-neutral-500">
              Press <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-xs">ESC</kbd> to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Predefined control sets for common actions
export const GAME_CONTROLS: ControlHint[] = [
  { key: 'WASD', action: 'Move', description: 'Arrow keys also work' },
  { key: 'SPACE', action: 'Jump/Action' },
  { key: 'ESC', action: 'Pause/Menu' },
  { key: 'R', action: 'Restart' },
  { key: 'M', action: 'Mute/Unmute' },
];

export const HUB_CONTROLS: ControlHint[] = [
  { key: '←→', action: 'Navigate', description: 'D-pad or arrow keys' },
  { key: 'A', action: 'Confirm', description: 'Enter or Space' },
  { key: 'B', action: 'Back', description: 'Escape or B button' },
  { key: 'LS', action: 'Rotate', description: 'Left stick movement' },
];

export const SHOP_CONTROLS: ControlHint[] = [
  { key: '↑↓', action: 'Navigate items' },
  { key: 'ENTER', action: 'Select item' },
  { key: 'ESC', action: 'Close/Back' },
  { key: 'F', action: 'Filter/Search' },
];
