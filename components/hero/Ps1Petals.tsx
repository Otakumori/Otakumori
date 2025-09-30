 

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface Petal {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  collected: boolean;
  spawnTime: number;
  driftSpeed: number;
  swayAmount: number;
}

interface Ps1PetalsProps {
  maxPetals?: number;
  spawnRate?: number;
  snapPixels?: number;
  ditherOpacity?: number;
  onPetalCollected: (petalId: string) => Promise<void>;
  className?: string;
}

export function Ps1Petals({
  maxPetals = 25,
  spawnRate = 2000,
  snapPixels = 4,
  ditherOpacity = 0.3,
  onPetalCollected,
  className = '',
}: Ps1PetalsProps) {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const animationRef = useRef<number | undefined>(undefined);
  const lastSpawnTime = useRef<number>(0);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // PS1-style vertex snapping
  const snapToGrid = (value: number): number => {
    return Math.round(value / snapPixels) * snapPixels;
  };

  // Spawn petal from tree coordinates
  const spawnPetal = useCallback(
    (treeX: number = 50, treeY: number = 30) => {
      if (petals.length >= maxPetals) return;

      const now = Date.now();
      if (now - lastSpawnTime.current < spawnRate) return;

      lastSpawnTime.current = now;

      // Start from tree position with some variation
      const startX = treeX + (Math.random() - 0.5) * 20;
      const startY = treeY + (Math.random() - 0.5) * 10;

      const newPetal: Petal = {
        id: `petal-${Date.now()}-${Math.random()}`,
        x: snapToGrid(startX),
        y: snapToGrid(startY),
        rotation: Math.floor((Math.random() * 360) / snapPixels) * snapPixels,
        scale: 0.8 + Math.random() * 0.4,
        collected: false,
        spawnTime: now,
        driftSpeed: 0.3 + Math.random() * 0.4,
        swayAmount: (Math.random() - 0.5) * 2,
      };

      setPetals((prev) => [...prev, newPetal]);
    },
    [petals.length, maxPetals, spawnRate, snapPixels],
  );

  // Collect petal
  const collectPetal = useCallback(
    async (petalId: string) => {
      setPetals((prev) =>
        prev.map((petal) => (petal.id === petalId ? { ...petal, collected: true } : petal)),
      );

      try {
        await onPetalCollected(petalId);
      } catch (error) {
        console.error('Failed to collect petal:', error);
      }

      // Remove petal after collection animation
      setTimeout(() => {
        setPetals((prev) => prev.filter((petal) => petal.id !== petalId));
      }, 800);
    },
    [onPetalCollected],
  );

  // Animation loop
  const startAnimation = useCallback(() => {
    if (!isVisible || prefersReducedMotion) return;

    const animate = () => {
      setPetals((prev) =>
        prev.map((petal) => {
          if (petal.collected) return petal;

          const time = Date.now() * 0.001;
          const sway = Math.sin(time * 0.5 + petal.id.length) * petal.swayAmount;

          return {
            ...petal,
            x: snapToGrid(petal.x + sway * 0.1),
            y: snapToGrid(petal.y - petal.driftSpeed),
            rotation: snapToGrid(petal.rotation + (prefersReducedMotion ? 0.5 : 1)),
          };
        }),
      );

      // Remove petals that go off-screen
      setPetals((prev) => prev.filter((petal) => petal.y > -10));

      // Auto-spawn if no petals
      if (petals.length < maxPetals * 0.3) {
        spawnPetal();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [isVisible, prefersReducedMotion, spawnPetal, petals.length, maxPetals]);

  // Handle tab visibility for performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
      if (document.hidden) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } else {
        startAnimation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [startAnimation]);

  // Start animation
  useEffect(() => {
    if (isVisible && !prefersReducedMotion) {
      startAnimation();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, prefersReducedMotion, startAnimation]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            className="pointer-events-auto absolute cursor-pointer"
            style={{
              left: `${petal.x}%`,
              top: `${petal.y}%`,
              imageRendering: 'pixelated', // PS1-style pixelation
            }}
            initial={{
              scale: 0,
              rotate: petal.rotation,
              opacity: 0,
              x: 0,
              y: 0,
            }}
            animate={{
              scale: petal.collected ? 0 : petal.scale,
              rotate: petal.rotation,
              opacity: petal.collected ? 0 : 1,
              x: petal.collected ? -20 : 0,
              y: petal.collected ? -20 : 0,
            }}
            exit={{
              scale: 0,
              opacity: 0,
              y: -50,
            }}
            transition={{
              duration: petal.collected ? 0.8 : 0.3,
              ease: 'easeOut',
            }}
            onClick={() => !petal.collected && collectPetal(petal.id)}
            whileHover={{
              scale: petal.scale * 1.2,
              filter: 'brightness(1.2)',
            }}
            whileTap={{
              scale: petal.scale * 0.8,
            }}
          >
            {/* PS1-style petal with dithering */}
            <div className="relative">
              {/* Main petal */}
              <div
                className="h-6 w-6 rounded-full bg-gradient-to-br from-pink-300 to-pink-400"
                style={{
                  boxShadow: `0 0 ${snapPixels}px rgba(236, 72, 153, 0.6)`,
                }}
              />

              {/* Dithering overlay for PS1 effect */}
              <div
                className="absolute inset-0 h-6 w-6 rounded-full opacity-60"
                style={{
                  backgroundImage: `
                    repeating-conic-gradient(
                      from 0deg,
                      transparent 0deg,
                      rgba(255, 255, 255, ${ditherOpacity}) 1deg,
                      transparent 2deg
                    )
                  `,
                  backgroundSize: `${snapPixels}px ${snapPixels}px`,
                }}
              />

              {/* Vertex snapping indicator (subtle) */}
              <div
                className="absolute inset-0 h-6 w-6 rounded-full border border-pink-200/30"
                style={{
                  borderWidth: `${Math.max(1, snapPixels / 4)}px`,
                }}
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
