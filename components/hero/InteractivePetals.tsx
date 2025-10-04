'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CANOPY_POINTS } from '@/app/components/tree/CherryTree';

interface Petal {
  id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  opacity: number;
  animationDuration: number;
  delay: number;
  collected: boolean;
  isActive: boolean;
  startTime: number;
}

interface InteractivePetalsProps {
  variant: 'hero' | 'spacer';
  maxPetals?: number;
  className?: string;
}

export default function InteractivePetals({
  variant,
  maxPetals = 12,
  className = '',
}: InteractivePetalsProps) {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastSpawnTime = useRef<number>(0);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Pause animation when document is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Generate petal from canopy points with jitter
  const generatePetal = useCallback((): Petal => {
    const canopyPoint = CANOPY_POINTS[Math.floor(Math.random() * CANOPY_POINTS.length)];
    const jitterX = (Math.random() - 0.5) * 20; // ±10% jitter
    const jitterY = (Math.random() - 0.5) * 10; // ±5% jitter

    return {
      id: `interactive-petal-${variant}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: Math.max(0, Math.min(100, canopyPoint.x * 100 + jitterX)),
      y: Math.max(0, Math.min(100, canopyPoint.y * 100 + jitterY)),
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      opacity: 0.3 + Math.random() * 0.4,
      animationDuration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
      collected: false,
      isActive: true,
      startTime: Date.now(),
    };
  }, [variant]);

  // Spawn petals with pool management
  const spawnPetals = useCallback(() => {
    if (reducedMotion || !isVisible) return;

    const now = Date.now();
    const timeSinceLastSpawn = now - lastSpawnTime.current;
    const spawnInterval = 2000; // Spawn every 2 seconds

    if (timeSinceLastSpawn >= spawnInterval) {
      setPetals((prev) => {
        const activePetals = prev.filter((p) => p.isActive && !p.collected);
        const newPetal = generatePetal();

        // Remove oldest petal if we're at max capacity
        if (activePetals.length >= maxPetals) {
          const oldestPetal = activePetals.reduce((oldest, current) =>
            current.startTime < oldest.startTime ? current : oldest,
          );
          return [...activePetals.filter((p) => p.id !== oldestPetal.id), newPetal];
        }

        return [...activePetals, newPetal];
      });

      lastSpawnTime.current = now;
    }
  }, [reducedMotion, isVisible, maxPetals, generatePetal]);

  // Animation loop for petal recycling
  useEffect(() => {
    if (reducedMotion || !isVisible) return;

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
  }, [reducedMotion, isVisible, spawnPetals]);

  // Initialize with some petals
  useEffect(() => {
    if (reducedMotion) return;

    const initialPetals = Array.from({ length: Math.min(maxPetals, 4) }, () => generatePetal());
    setPetals(initialPetals);
  }, [maxPetals, reducedMotion, generatePetal]);

  // Handle petal click with hit-testing
  const handlePetalClick = useCallback(
    (petal: Petal, event: React.MouseEvent) => {
      if (petal.collected) return;

      // Perform hit-test to ensure petal is topmost element
      const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
      const petalElement = event.currentTarget as HTMLElement;

      // Only collect if the petal is the topmost element
      if (elementAtPoint !== petalElement) {
        return;
      }

      // Mark petal as collected
      setPetals((prev) =>
        prev.map((p) => (p.id === petal.id ? { ...p, collected: true, opacity: 0 } : p)),
      );

      // Optional: Add collection feedback
      // Could emit telemetry event here
      // console.log(`Petal collected in ${variant} section`);
    },
    [variant],
  );

  // Don't render if reduced motion is preferred
  if (reducedMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-auto ${className}`}
      aria-hidden="true"
    >
      {petals
        .filter((petal) => petal.isActive && !petal.collected)
        .map((petal) => (
          <div
            key={petal.id}
            className="absolute w-2 h-2 bg-pink-300/60 rounded-full cursor-pointer transition-opacity duration-500"
            style={{
              left: `${petal.x}%`,
              top: `${petal.y}%`,
              transform: `rotate(${petal.rotation}deg) scale(${petal.scale})`,
              opacity: petal.opacity,
              animation: isVisible
                ? `petal-fall ${petal.animationDuration}s linear infinite`
                : 'none',
              animationDelay: `${petal.delay}s`,
              willChange: isVisible ? 'transform, opacity' : 'auto',
            }}
            onClick={(e) => handlePetalClick(petal, e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handlePetalClick(petal, e as any);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Collectible petal"
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
