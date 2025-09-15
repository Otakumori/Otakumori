'use client';

import React, { useEffect, useState } from 'react';

interface Petal {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  animationDuration: number;
  delay: number;
}

interface PetalLayerProps {
  count?: number;
  intensity?: 'low' | 'medium' | 'high';
  className?: string;
}

export default function PetalLayer({
  count = 20,
  intensity = 'medium',
  className = '',
}: PetalLayerProps) {
  const [petals, setPetals] = useState<Petal[]>([]);

  const intensityMultipliers = {
    low: { count: 0.5, speed: 0.7 },
    medium: { count: 1, speed: 1 },
    high: { count: 1.5, speed: 1.3 },
  };

  const multiplier = intensityMultipliers[intensity];
  const actualCount = Math.floor(count * multiplier.count);

  useEffect(() => {
    const generatePetals = (): Petal[] => {
      return Array.from({ length: actualCount }, (_, i) => ({
        id: `petal-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.4,
        animationDuration: (3 + Math.random() * 4) / multiplier.speed,
        delay: Math.random() * 2,
      }));
    };

    setPetals(generatePetals());
  }, [actualCount, multiplier.speed]);

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute w-2 h-2 bg-pink-300/60 rounded-full"
          style={{
            left: `${petal.x}%`,
            top: `${petal.y}%`,
            transform: `rotate(${petal.rotation}deg) scale(${petal.scale})`,
            opacity: petal.opacity,
            animation: `petal-fall ${petal.animationDuration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
          }}
        />
      ))}

      <style jsx>{`
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
      `}</style>
    </div>
  );
}
