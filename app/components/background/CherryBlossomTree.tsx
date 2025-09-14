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
  const animationRef = useRef<number>();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const createPetals = () => {
      const newPetals: Petal[] = [];
      
      // Create petals at the top of the tree (where the pink leaves would be)
      for (let i = 0; i < 3; i++) { // Fewer petals for better performance
        newPetals.push({
          id: `petal-${Date.now()}-${i}`,
          x: Math.random() * 350 + 20, // Tree width area (w-96 = 384px)
          y: -10 - Math.random() * 20, // Start above viewport
          rotation: Math.random() * 360,
          scale: Math.random() * 0.4 + 0.8, // Larger, more visible petals
          speed: Math.random() * 0.8 + 0.4, // Slightly faster
          opacity: Math.random() * 0.7 + 0.5, // More opaque
          drift: (Math.random() - 0.5) * 0.8, // More natural drift
        });
      }
      
      setPetals(prev => [...prev, ...newPetals]);
    };

    // Create initial petals
    createPetals();
    
    // Create new petals periodically (less frequent for better performance)
    const petalInterval = setInterval(createPetals, 4000);

    const animatePetals = () => {
      setPetals(prev => 
        prev
          .map(petal => ({
            ...petal,
            y: petal.y + petal.speed,
            x: petal.x + petal.drift,
            rotation: petal.rotation + 1,
          }))
          .filter(petal => petal.y < window.innerHeight + 50) // Remove petals that are off screen
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
    <div
      ref={containerRef}
      className="fixed inset-0 z-1 pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {/* Cherry Blossom Tree - Fixed to Left Side */}
      <div className="fixed left-0 top-0 h-screen w-96 flex items-end pointer-events-none z-0">
        <div className="relative h-screen w-full">
          <Image
            src="/assets/images/CherryTree.png"
            alt="Cherry Blossom Tree"
            fill
            className="object-contain object-left-bottom"
            priority
            sizes="(max-width: 768px) 100vw, 384px"
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
