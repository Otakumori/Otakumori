'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface Petal {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  speed: number;
  opacity: number;
  drift: number;
  }

export default function CherryBlossomTree() {
  const [mounted, setMounted] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // Skip petal animations for reduced motion

    const createPetals = () => {
      const newPetals: Petal[] = [];

      // Create petals at the top of the tree (where the pink leaves would be)
      for (let i = 0; i < 3; i++) {
        // Fewer petals for better performance
        newPetals.push({
          id: `petal-${Date.now()}-${i}`,
          x: Math.random() * 350 + 20, // Tree width area (w-96 = 384px)
          y: -10 - Math.random() * 20, // Start above viewport
          rotation: Math.random() * 360,
          scale: Math.random() * 0.4 + 0.8, // Larger, more visible petals
          speed: Math.random() * 0.8 + 0.4, // Slightly faster
          opacity: Math.random() * 0.25 + 0.5, // Max 0.75 opacity
          drift: (Math.random() - 0.5) * 0.8, // More natural drift
        });
      }

      setPetals((prev) => [...prev, ...newPetals]);
    };

    // Create initial petals
    createPetals();

    // Create new petals periodically - 1-2 petals per second average
    const petalInterval = setInterval(createPetals, 800); // ~1.25 petals per second

    // Gust functionality - more petals every 15-20 seconds
    const createGust = () => {
      const gustPetals: Petal[] = [];
      for (let i = 0; i < 8; i++) {
        // More petals for gust
        gustPetals.push({
          id: `petal-gust-${Date.now()}-${i}`,
          x: Math.random() * 350 + 20,
          y: -10 - Math.random() * 20,
          rotation: Math.random() * 360,
          scale: Math.random() * 0.4 + 0.8,
          speed: Math.random() * 1.2 + 0.6, // Faster for gust
          opacity: Math.random() * 0.25 + 0.5, // Max 0.75 opacity
          drift: (Math.random() - 0.5) * 1.2, // More drift for gust
        });
      }
      setPetals((prev) => [...prev, ...gustPetals]);
    };

    // Random gust timing between 15-20 seconds
    const scheduleGust = () => {
      const delay = Math.random() * 5000 + 15000; // 15-20 seconds
      setTimeout(() => {
        createGust();
        scheduleGust(); // Schedule next gust
      }, delay);
    };
    scheduleGust();

    const animatePetals = () => {
      setPetals(
        (prev) =>
          prev
            .map((petal) => ({
              ...petal,
              y: petal.y + petal.speed,
              x: petal.x + petal.drift,
              rotation: petal.rotation + 1,
            }))
            .filter((petal) => petal.y < window.innerHeight + 50), // Remove petals that are off screen
      );

      animationRef.current = requestAnimationFrame(animatePetals);
    };

    animationRef.current = requestAnimationFrame(animatePetals);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      clearInterval(petalInterval);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-1 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Cherry Blossom Tree - Left-anchored with half trunk visible */}
      <div className="fixed left-0 top-0 h-screen w-96 flex items-end pointer-events-none z-0">
        <div className="relative h-screen w-full">
          <Image
            src="/assets/images/cherry-tree.png"
            alt="Cherry Blossom Tree"
            fill
            className="object-contain object-left-bottom"
            priority
            sizes="(max-width: 768px) 100vw, 384px"
            style={{ marginLeft: '-50%' }} // Show only half the trunk
          />
        </div>
      </div>

      {/* Falling Petals */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute pointer-events-none"
          style={{
            left: `${petal.x}px`,
            top: `${petal.y}px`,
            transform: `rotate(${petal.rotation}deg) scale(${petal.scale})`,
            opacity: petal.opacity,
            zIndex: 2,
          }}
        >
          <div className="w-3 h-3 bg-pink-300 rounded-full opacity-80 shadow-sm" />
        </div>
      ))}
    </div>
  );
}
