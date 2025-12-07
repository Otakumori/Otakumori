'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useGust } from './fx/useGust';

interface Petal {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  animationDuration: number;
  delay: number;
  isActive: boolean;
  startTime: number;
  }

interface PetalLayerProps {
  count?: number;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
  maxPetals?: number;
}

export default function PetalLayer({
  count = 20,
  intensity = 'medium',
  className = '',
  maxPetals = 40,
}: PetalLayerProps) {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const animationRef = useRef<number | undefined>(undefined);
  const lastSpawnTime = useRef<number>(0);
  const gust = useGust();

  const intensityMultipliers = {
    low: { count: 0.5, speed: 0.7, spawnRate: 0.3 },
    medium: { count: 1, speed: 1, spawnRate: 0.5 },
    high: { count: 1.5, speed: 1.3, spawnRate: 0.8 },
  };

  const multiplier = intensityMultipliers[intensity];
  const actualCount = Math.min(Math.floor(count * multiplier.count), maxPetals);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Pause animation when document is hidden
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const generatePetal = useCallback(
    (): Petal => ({
      id: `petal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: Math.random() * 100,
      y: -10, // Start above viewport
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.4,
      animationDuration: (3 + Math.random() * 4) / multiplier.speed,
      delay: Math.random() * 2,
      isActive: true,
      startTime: Date.now(),
    }),
    [multiplier.speed],
  );

  const spawnPetals = useCallback(() => {
    if (prefersReducedMotion || !isVisible) return;

    const now = Date.now();
    const timeSinceLastSpawn = now - lastSpawnTime.current;
    const spawnInterval = 1000 / multiplier.spawnRate; // Convert spawnRate to interval

    if (timeSinceLastSpawn >= spawnInterval) {
      setPetals((prev) => {
        const activePetals = prev.filter((p) => p.isActive);
        const newPetal = generatePetal();

        // Remove oldest petal if we're at max capacity
        if (activePetals.length >= actualCount) {
          const oldestPetal = activePetals.reduce((oldest, current) =>
            current.startTime < oldest.startTime ? current : oldest,
          );
          return [...activePetals.filter((p) => p.id !== oldestPetal.id), newPetal];
        }

        return [...activePetals, newPetal];
      });

      lastSpawnTime.current = now;
    }
  }, [prefersReducedMotion, isVisible, multiplier.spawnRate, actualCount, generatePetal]);

  // Animation loop for petal recycling
  useEffect(() => {
    if (prefersReducedMotion || !isVisible) return;

    const animate = () => {
      spawnPetals();

      // Mark petals as inactive after their animation duration
      setPetals((prev) =>
        prev.map((petal) => {
          const elapsed = Date.now() - petal.startTime;
          const totalDuration = (petal.animationDuration + petal.delay) * 1000;

          if (elapsed > totalDuration) {
            return { ...petal, isActive: false };
          }
          return petal;
        }),
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prefersReducedMotion, isVisible, spawnPetals]);

  // Initialize with some petals
  useEffect(() => {
    if (prefersReducedMotion) return;

    const initialPetals = Array.from({ length: Math.min(actualCount, 10) }, () => generatePetal());
    setPetals(initialPetals);
  }, [actualCount, prefersReducedMotion, generatePetal]);

  // Don't render if reduced motion is preferred
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {petals
        .filter((petal) => petal.isActive)
        .map((petal) => (
          <div
            key={petal.id}
            className="absolute w-2 h-2 bg-pink-300/60 rounded-full"
            style={{
              left: `${petal.x}%`,
              top: `${petal.y}%`,
              transform: `rotate(${petal.rotation}deg) scale(${petal.scale})`,
              opacity: petal.opacity,
              animation: isVisible
                ? `petal-fall ${petal.animationDuration / gust}s linear infinite`
                : 'none',
              animationDelay: `${petal.delay}s`,
              willChange: isVisible ? 'transform, opacity' : 'auto',
            }}
          />
        ))}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes petal-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .absolute {
            animation: none !important;
          }
        }
        `,
        }}
      />
    </div>
  );
}
