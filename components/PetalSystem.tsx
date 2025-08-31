/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSessionToken } from '@/lib/authToken';

interface Petal {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  collected: boolean;
}

interface PetalSystemProps {
  onPetalCollected: (count: number) => void;
  petalsCollected: number;
}

export function PetalSystem({ onPetalCollected, petalsCollected }: PetalSystemProps) {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const animationRef = useRef<number>();
  const lastSpawnTime = useRef<number>(0);
  const getToken = useSessionToken();

  // Performance settings based on device capability
  const [maxPetals, setMaxPetals] = useState(25);
  const spawnInterval = 2000; // 2 seconds between spawns

  // Set client-side values
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMaxPetals(window.innerWidth < 768 ? 15 : 25);
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

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
  }, []);

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const spawnPetal = useCallback(() => {
    if (petals.length >= maxPetals) return;

    const now = Date.now();
    if (now - lastSpawnTime.current < spawnInterval) return;

    lastSpawnTime.current = now;

    const newPetal: Petal = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10, // 10% to 90% of screen width
      y: Math.random() * 60 + 20, // 20% to 80% of screen height
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
      collected: false,
    };

    setPetals((prev) => [...prev, newPetal]);
  }, [petals.length, maxPetals]);

  const collectPetal = useCallback(
    async (petalId: number) => {
      setPetals((prev) =>
        prev.map((petal) => (petal.id === petalId ? { ...petal, collected: true } : petal)),
      );

      // Remove petal after collection animation
      setTimeout(() => {
        setPetals((prev) => prev.filter((petal) => petal.id !== petalId));
      }, 500);

      // Update collection count
      onPetalCollected(1);

      // Send to API if user is authenticated
      try {
        const token = await getToken();
        if (token) {
          await fetch('/api/petals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ petals_to_add: 1 }),
          });
        }
      } catch (error) {
        // Silently fail if not authenticated or API error
        console.log('Petal collection not tracked (user not signed in)');
      }
    },
    [onPetalCollected, getToken],
  );

  const startAnimation = useCallback(() => {
    if (!isVisible || prefersReducedMotion) return;

    const animate = () => {
      setPetals((prev) =>
        prev.map((petal) => ({
          ...petal,
          y: petal.y - 0.5, // Gentle upward drift
          rotation: petal.rotation + (prefersReducedMotion ? 0.5 : 1), // Slower rotation if reduced motion
        })),
      );

      // Remove petals that go off-screen
      setPetals((prev) => prev.filter((petal) => petal.y > -10));

      // Spawn new petals
      spawnPetal();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [isVisible, prefersReducedMotion, spawnPetal]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  if (prefersReducedMotion) {
    return null; // Don't render petal system if user prefers reduced motion
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <AnimatePresence>
        {petals.map((petal) => (
          <motion.div
            key={petal.id}
            className="absolute cursor-pointer pointer-events-auto"
            style={{
              left: `${petal.x}%`,
              top: `${petal.y}%`,
            }}
            initial={{
              scale: 0,
              rotate: petal.rotation,
              opacity: 0,
            }}
            animate={{
              scale: petal.collected ? 0 : petal.scale,
              rotate: petal.rotation,
              opacity: petal.collected ? 0 : 1,
              y: petal.collected ? -20 : 0,
            }}
            exit={{
              scale: 0,
              opacity: 0,
              y: -50,
            }}
            transition={{
              duration: petal.collected ? 0.5 : 0.3,
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
            <div className="text-2xl select-none">🌸</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
