'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2, VolumeX, Vibrate } from 'lucide-react';
import { useSound } from '@/lib/hooks/useSound';
import { useHaptic } from '@/lib/hooks/useHaptic';

export function SoundSettings() {
  const { playSound } = useSound();
  const { vibrate } = useHaptic();

  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (!next) {
        void playSound('/assets/sounds/ui-click.mp3');
      }
      return next;
    });
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full bg-gray-800/70 p-3 text-white shadow-lg backdrop-blur"
        aria-expanded={isOpen}
        aria-label="Sound settings"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Volume2 className="h-5 w-5" aria-hidden="true" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-0 rounded-lg bg-gray-900/80 p-4 text-white shadow-lg backdrop-blur"
          >
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Sound</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMute}
                  className="rounded-lg bg-white/10 p-2"
                  aria-pressed={isMuted}
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </motion.button>
              </div>

              <div className="flex items-center justify-between">
                <span>Haptic</span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => vibrate('light')}
                  className="rounded-lg bg-white/10 p-2"
                  aria-label="Trigger haptic feedback"
                >
                  <Vibrate className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SoundSettings;
