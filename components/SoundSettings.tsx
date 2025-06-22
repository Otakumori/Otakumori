'use client';
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';
import { useState } from 'react';

export const SoundSettings = () => {
  const { isMuted, toggleMute, playSound } = useSound();
  const { vibrate } = useHaptic();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    toggleMute();
    vibrate('light');
    playSound('click');
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full bg-gray-800/50 p-3 shadow-lg backdrop-blur-lg"
      >
        {isMuted ? '🔇' : '🔊'}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-0 rounded-lg bg-gray-800/50 p-4 shadow-lg backdrop-blur-lg"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-white">Sound</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleToggle}
                  className={`rounded-lg p-2 ${isMuted ? 'bg-red-500/20' : 'bg-green-500/20'}`}
                >
                  {isMuted ? '🔇' : '🔊'}
                </motion.button>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-white">Haptic</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => vibrate('light')}
                  className="rounded-lg bg-blue-500/20 p-2"
                >
                  📳
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
