'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Generate petals with proper positioning
  useEffect(() => {
    if (reducedMotion) return;

    const generatePetals = (): Petal[] => {
      return Array.from({ length: maxPetals }, (_, i) => ({
        id: `interactive-petal-${variant}-${i}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
        opacity: 0.3 + Math.random() * 0.4,
        animationDuration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
        collected: false,
      }));
    };

    setPetals(generatePetals());
  }, [maxPetals, variant, reducedMotion]);

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
      {petals.map((petal) => (
        <div
          key={petal.id}
          className={`absolute w-2 h-2 bg-pink-300/60 rounded-full cursor-pointer transition-opacity duration-500 ${
            petal.collected ? 'opacity-0' : 'opacity-100'
          }`}
          style={{
            left: `${petal.x}%`,
            top: `${petal.y}%`,
            transform: `rotate(${petal.rotation}deg) scale(${petal.scale})`,
            opacity: petal.opacity,
            animation: `petal-fall ${petal.animationDuration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
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
