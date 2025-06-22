'use client';
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { usePetalContext } from '../providers';

interface Petal {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
}

export default function CherryBlossomEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [petals, setPetals] = useState<Petal[]>([]);
  const controls = useAnimation();
  const petalContext = usePetalContext();

  useEffect(() => {
    const createPetal = () => {
      const id = Date.now() + Math.random();
      const x = Math.random() * window.innerWidth;
      const y = -50;
      const rotation = Math.random() * 360;
      const scale = Math.random() * 0.5 + 0.5;
      const opacity = Math.random() * 0.5 + 0.5;

      return { id, x, y, rotation, scale, opacity };
    };

    const interval = setInterval(() => {
      if (petals.length < 20) {
        setPetals(prev => [...prev, createPetal()]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [petals.length]);

  const handlePetalClick = (id: number) => {
    setPetals(prev => prev.filter(p => p.id !== id));
    controls.start({
      scale: [1, 1.2, 1],
      transition: { duration: 0.3 },
    });
  };

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ overflow: 'hidden' }}
    >
      {petals.map(petal => (
        <motion.div
          key={petal.id}
          className="pointer-events-auto absolute cursor-pointer"
          style={{
            x: petal.x,
            y: petal.y,
            rotate: petal.rotation,
            scale: petal.scale,
            opacity: petal.opacity,
          }}
          animate={{
            y: window.innerHeight + 50,
            rotate: petal.rotation + 360,
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            ease: 'linear',
            repeat: Infinity,
          }}
          onClick={() => handlePetalClick(petal.id)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
              fill="#FF69B4"
            />
            <path
              d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
              fill="#FFB6C1"
            />
          </svg>
        </motion.div>
      ))}
      <motion.div
        className="fixed bottom-4 right-4 rounded-lg bg-black/50 px-4 py-2 text-white"
        animate={controls}
      >
        Petals: {petals.length}
      </motion.div>
    </div>
  );
}
