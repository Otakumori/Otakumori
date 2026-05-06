// DEPRECATED: This component is a duplicate. Use app\components\GameCubeBoot.js instead.
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GameCubeBootProps {
  onBootComplete: () => void;
}

export default function GameCubeBoot({ onBootComplete }: GameCubeBootProps) {
  const [bootStage, setBootStage] = useState<'start' | 'logo' | 'loading' | 'complete'>('start');
  const [bootSeen, setBootSeen] = useState(false);

  useEffect(() => {
    // Check if boot has been seen this session
    const hasBooted = sessionStorage.getItem('otakumori-boot-seen');
    if (hasBooted) {
      setBootSeen(true);
      onBootComplete();
      return;
    }

    // Start boot sequence
    const timer1 = setTimeout(() => setBootStage('logo'), 500);
    const timer2 = setTimeout(() => setBootStage('loading'), 2000);
    const timer3 = setTimeout(() => {
      setBootStage('complete');
      sessionStorage.setItem('otakumori-boot-seen', 'true');
      setTimeout(onBootComplete, 1000);
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onBootComplete]);

  if (bootSeen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      >
        {/* Boot sequence */}
        <div className="text-center">
          {/* Stage 1: Start */}
          <AnimatePresence>
            {bootStage === 'start' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-pink-400 text-6xl font-bold tracking-wider"
              >
                OT
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 2: Logo */}
          <AnimatePresence>
            {bootStage === 'logo' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-center"
              >
                <div className="text-pink-400 text-6xl font-bold tracking-wider mb-4">
                  OTAKUMORI
                </div>
                <div className="text-neutral-400 text-lg">Loading the realm...</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 3: Loading */}
          <AnimatePresence>
            {bootStage === 'loading' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="text-pink-400 text-4xl font-bold tracking-wider mb-6">
                  OTAKUMORI
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div
                    className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
                <div className="text-neutral-400 text-sm">Initializing mini-games...</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 4: Complete */}
          <AnimatePresence>
            {bootStage === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="text-center"
              >
                <div className="text-pink-400 text-4xl font-bold tracking-wider mb-4">READY</div>
                <div className="text-neutral-400 text-lg">Enter the arena...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
