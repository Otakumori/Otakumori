'use client';
'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Petal {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  duration: number;
  delay: number;
}

const CherryBlossom = () => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    const createPetal = (id: number): Petal => ({
      id,
      x: Math.random() * 100,
      y: -10,
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      duration: 5 + Math.random() * 5,
      delay: Math.random() * 5,
    });

    const MAX_PETALS = 30;
    const SPAWN_INTERVAL = 1000;
    let animationFrameId: number;
    let lastSpawnTime = 0;

    const initialPetals = Array.from({ length: 15 }, (_, i) => createPetal(i));
    setPetals(initialPetals);

    const animate = (timestamp: number) => {
      if (timestamp - lastSpawnTime >= SPAWN_INTERVAL) {
        setPetals(prev => {
          if (prev.length >= MAX_PETALS) {
            return prev;
          }
          return [...prev, createPetal(prev.length)];
        });
        lastSpawnTime = timestamp;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0">
      <AnimatePresence>
        {petals.map(petal => (
          <motion.div
            key={petal.id}
            initial={{
              x: `${petal.x}%`,
              y: `${petal.y}%`,
              rotate: petal.rotation,
              scale: petal.scale,
              opacity: 0.8,
            }}
            animate={{
              y: '110%',
              x: `${petal.x + (Math.random() * 40 - 20)}%`,
              rotate: petal.rotation + 720,
              opacity: 0,
            }}
            transition={{
              duration: petal.duration,
              delay: petal.delay,
              ease: [0.4, 0, 0.2, 1],
              repeat: Infinity,
              repeatType: 'loop',
            }}
            className="absolute"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-pink-200/80"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CherryBlossom;
