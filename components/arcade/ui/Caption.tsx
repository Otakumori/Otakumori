'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CaptionProps {
  text: string;
  duration?: number;
  onComplete?: () => void;
}

export function Caption({ text, duration = 2000, onComplete }: CaptionProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <div className="bg-black/80 backdrop-blur-sm text-white px-6 py-3 rounded-lg border border-pink-500/30 shadow-lg">
            <p className="text-lg font-medium text-center whitespace-nowrap">{text}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
