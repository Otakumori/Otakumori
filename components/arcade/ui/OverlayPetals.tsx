'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Petal {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface OverlayPetalsProps {
  count?: number;
  duration?: number;
  onComplete?: () => void;
}

export function OverlayPetals({ count = 20, duration = 2000, onComplete }: OverlayPetalsProps) {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const newPetals: Petal[] = [];
    for (let i = 0; i < count; i++) {
      newPetals.push({
        id: `petal-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      });
    }
    setPetals(newPetals);

    const timer = setTimeout(() => {
      setPetals([]);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [count, duration, onComplete]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            initial={{
              opacity: 0,
              scale: 0,
              x: `${petal.x}%`,
              y: `${petal.y}%`,
              rotate: petal.rotation,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, petal.scale, 0],
              y: [`${petal.y}%`, `${petal.y + 20}%`],
              rotate: petal.rotation + 180,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: duration / 1000,
              ease: 'easeOut',
            }}
            className="absolute"
          >
            <div className="w-3 h-3 bg-pink-400 rounded-full opacity-80" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
