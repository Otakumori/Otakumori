'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Cherry Petal Layer Component
 *
 * Sprite-based falling petals overlay for the home hero cherry tree.
 * Uses the sprite sheet at /assets/images/petal_sprite.png (4x3 grid, 12 variants).
 *
 * Features:
 * - GPU-optimized CSS transforms only
 * - Respects prefers-reduced-motion
 * - Clickable petals route to /petal-shop
 * - Recycles DOM nodes for performance
 */

const SPRITE_COLS = 4;
const SPRITE_ROWS = 3;
const TOTAL_SPRITES = SPRITE_COLS * SPRITE_ROWS;

interface PetalConfig {
  id: string;
  frameIndex: number; // 0-11
  startX: number; // Percentage (0-100)
  startY: number; // Percentage (0-100)
  fallDuration: number; // seconds
  delay: number; // seconds
  drift: number; // horizontal drift percentage
  scale: number; // 0.8-1.2
  rotation: number; // degrees
  finalRotation: number; // degrees
  isClickable: boolean;
}

interface CherryPetalLayerProps {
  maxPetals?: number;
  clickDestination?: string;
  enabled?: boolean;
}

export default function CherryPetalLayer({
  maxPetals = 15,
  clickDestination = '/petal-shop',
  enabled = true,
}: CherryPetalLayerProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [petals, setPetals] = useState<PetalConfig[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const petalElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const clickedPetalIdsRef = useRef<Set<string>>(new Set());

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Generate initial petal configurations
  const generatePetalConfig = useCallback((): PetalConfig => {
    // Bias spawn positions over tree canopy (left side, 10-40% from left, 0-60% from top)
    const startX = 10 + Math.random() * 30;
    const startY = Math.random() * 60;

    return {
      id: `petal-${Date.now()}-${Math.random()}`,
      frameIndex: Math.floor(Math.random() * TOTAL_SPRITES),
      startX,
      startY,
      fallDuration: 12 + Math.random() * 8, // 12-20 seconds
      delay: Math.random() * 3, // Stagger appearance
      drift: (Math.random() - 0.5) * 15, // -7.5% to +7.5% horizontal drift
      scale: 0.8 + Math.random() * 0.4, // 0.8-1.2
      rotation: Math.random() * 360,
      finalRotation: Math.random() * 720 - 360, // -360 to +360 degrees
      isClickable: Math.random() < 0.35, // 35% are clickable
    };
  }, []);

  // Initialize petals
  useEffect(() => {
    if (!enabled) return;

    const initialPetals: PetalConfig[] = [];
    for (let i = 0; i < maxPetals; i++) {
      initialPetals.push(generatePetalConfig());
    }
    setPetals(initialPetals);
  }, [enabled, maxPetals, generatePetalConfig]);

  // Handle petal click/keyboard interaction
  const handlePetalInteraction = useCallback(
    (petalId: string, e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();

      if (clickedPetalIdsRef.current.has(petalId)) return;

      const petal = petals.find((p) => p.id === petalId);
      if (!petal || !petal.isClickable) return;

      // Handle keyboard: only proceed on Enter/Space
      if ('key' in e && e.key !== 'Enter' && e.key !== ' ') {
        return;
      }

      clickedPetalIdsRef.current.add(petalId);

      // Pop animation
      const element = petalElementsRef.current.get(petalId);
      if (element) {
        element.style.transform += ' scale(1.3)';
        setTimeout(() => {
          if (element) {
            element.style.opacity = '0';
          }
        }, 150);
      }

      // Navigate after brief delay
      setTimeout(() => {
        router.push(clickDestination);
      }, 200);
    },
    [petals, router, clickDestination],
  );

  // Get sprite background position for a frame index
  const getSpritePosition = (frameIndex: number) => {
    const col = frameIndex % SPRITE_COLS;
    const row = Math.floor(frameIndex / SPRITE_COLS);

    // Calculate percentage positions
    const xPercent = (col / (SPRITE_COLS - 1)) * 100;
    const yPercent = (row / (SPRITE_ROWS - 1)) * 100;

    return { xPercent, yPercent };
  };

  if (!enabled) return null;

  // Reduced motion: render static petals
  if (reducedMotion) {
    return (
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {petals.slice(0, 3).map((petal) => {
          const { xPercent, yPercent } = getSpritePosition(petal.frameIndex);
          const isClickable = petal.isClickable && !clickedPetalIdsRef.current.has(petal.id);

          return (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions
            <div
              key={petal.id}
              ref={(el) => {
                if (el) petalElementsRef.current.set(petal.id, el);
              }}
              className={`absolute pointer-events-auto ${
                isClickable ? 'cursor-pointer hover:scale-110 transition-transform' : ''
              }`}
              style={{
                left: `${petal.startX}%`,
                top: `${petal.startY + 20}%`, // Place them lower, static
                transform: `translate(-50%, -50%) rotate(${petal.rotation}deg) scale(${petal.scale * 0.2})`,
                width: '32px',
                height: '32px',
                backgroundImage: 'url(/assets/images/petal_sprite.png)',
                backgroundRepeat: 'no-repeat',
                backgroundSize: `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
                backgroundPosition: `${xPercent}% ${yPercent}%`,
                opacity: isClickable ? 0.4 : 0.25,
                filter: isClickable ? 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.3))' : 'none',
              }}
              onClick={(e) => handlePetalInteraction(petal.id, e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handlePetalInteraction(petal.id, e);
                }
              }}
              role={isClickable ? 'button' : undefined}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={isClickable ? 0 : undefined}
              aria-label={isClickable ? 'Click to visit petal shop' : undefined}
            />
          );
        })}
      </div>
    );
  }

  // Normal motion: animated falling petals
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {petals.map((petal) => {
        const { xPercent, yPercent } = getSpritePosition(petal.frameIndex);
        const isClickable = petal.isClickable && !clickedPetalIdsRef.current.has(petal.id);
        const isClicked = clickedPetalIdsRef.current.has(petal.id);

        return (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            key={petal.id}
            ref={(el) => {
              if (el) petalElementsRef.current.set(petal.id, el);
            }}
            className={`absolute pointer-events-auto ${
              isClickable && !isClicked
                ? 'cursor-pointer hover:scale-110 transition-transform duration-200'
                : ''
            }`}
            style={{
              left: `${petal.startX}%`,
              top: `${petal.startY}%`,
              width: '32px',
              height: '32px',
              backgroundImage: 'url(/assets/images/petal_sprite.png)',
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
              backgroundPosition: `${xPercent}% ${yPercent}%`,
              opacity: isClicked ? 0 : isClickable ? 0.4 : 0.25,
              filter:
                isClickable && !isClicked ? 'drop-shadow(0 0 3px rgba(236, 72, 153, 0.3))' : 'none',
              transform: `translate(-50%, -50%) rotate(${petal.rotation}deg) scale(${petal.scale * 0.2})`,
              animation: isClicked
                ? 'none'
                : `petal-fall ${petal.fallDuration * 1.5}s ease-in-out ${petal.delay}s infinite`,
              // CSS custom properties for animation
              ['--drift' as string]: `${petal.drift * 0.5}%`,
              ['--final-rotation' as string]: `${petal.finalRotation}deg`,
              ['--initial-rotation' as string]: `${petal.rotation}deg`,
              ['--scale' as string]: `${petal.scale * 0.2}`,
            }}
            onClick={(e) => handlePetalInteraction(petal.id, e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handlePetalInteraction(petal.id, e);
              }
            }}
            role={isClickable ? 'button' : undefined}
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
            tabIndex={isClickable ? 0 : undefined}
            aria-label={isClickable ? 'Click to visit petal shop' : undefined}
          />
        );
      })}
    </div>
  );
}
