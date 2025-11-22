/**
 * Petal Flow Overlay Component
 * Animated petals that flow from around the hero tree image
 * Clickable petals navigate to petal shop
 *
 * Note: This is a cosmetic HUD skin unlocked via petal shop.
 * Current implementation uses localStorage, ready for backend sync.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export interface PetalFlowOverlayProps {
  onPetalClick?: () => void;
  petalCount?: number; // Number of petals to render (default: 8)
}

interface Petal {
  id: string;
  x: number; // Percentage from left (0-100)
  y: number; // Percentage from top (0-100)
  delay: number; // Animation delay in seconds
  duration: number; // Animation duration in seconds
  isClickable: boolean; // Whether this petal can be clicked
  rotation: number; // Initial rotation in degrees
}

/**
 * Generate random petal positions around tree area
 * Petals originate from sides/bottom of tree image
 */
function generatePetals(count: number): Petal[] {
  const petals: Petal[] = [];

  for (let i = 0; i < count; i++) {
    // Position petals around tree area (center-left to center-right, top to bottom)
    // Tree is typically centered, so petals flow from sides
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const x =
      side === 'left'
        ? 20 + Math.random() * 15 // Left side: 20-35%
        : 65 + Math.random() * 15; // Right side: 65-80%

    const y = 10 + Math.random() * 80; // Top 10% to bottom 90%

    petals.push({
      id: `petal-${i}`,
      x,
      y,
      delay: Math.random() * 2, // Stagger appearance
      duration: 8 + Math.random() * 4, // 8-12 seconds drift
      isClickable: Math.random() < 0.3, // 30% are clickable
      rotation: Math.random() * 360,
    });
  }

  return petals;
}

/**
 * Petal Flow Overlay
 * Renders animated petals that drift from around the tree
 * Clickable petals navigate to petal shop
 */
export function PetalFlowOverlay({ onPetalClick, petalCount = 8 }: PetalFlowOverlayProps) {
  const router = useRouter();
  const [petals, setPetals] = useState<Petal[]>([]);
  const [clickedPetalIds, setClickedPetalIds] = useState<Set<string>>(new Set());

  // Generate petals on mount
  useEffect(() => {
    setPetals(generatePetals(petalCount));
  }, [petalCount]);

  const handlePetalClick = useCallback(
    (petal: Petal) => {
      if (!petal.isClickable || clickedPetalIds.has(petal.id)) return;

      // Mark as clicked
      setClickedPetalIds((prev) => new Set(prev).add(petal.id));

      // Call custom handler or navigate to petal shop
      if (onPetalClick) {
        onPetalClick();
      } else {
        router.push('/petal-shop');
      }
    },
    [onPetalClick, router, clickedPetalIds],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      <AnimatePresence>
        {petals.map((petal) => {
          const isClicked = clickedPetalIds.has(petal.id);

          return (
            <motion.div
              key={petal.id}
              initial={{ opacity: 0, scale: 0, rotate: petal.rotation }}
              animate={{
                opacity: isClicked ? 0 : [0, 1, 1, 0],
                scale: isClicked ? 0 : [0, 1, 1, 0],
                x: isClicked
                  ? 0
                  : [
                      `${petal.x}%`,
                      `${petal.x + (Math.random() - 0.5) * 20}%`,
                      `${petal.x + (Math.random() - 0.5) * 30}%`,
                      `${petal.x + (Math.random() - 0.5) * 40}%`,
                    ],
                y: isClicked
                  ? 0
                  : [
                      `${petal.y}%`,
                      `${petal.y + Math.random() * 20}%`,
                      `${petal.y + Math.random() * 40}%`,
                      `${petal.y + Math.random() * 60}%`,
                    ],
                rotate: petal.rotation + (Math.random() - 0.5) * 180,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: petal.duration * 1.5,
                delay: petal.delay,
                repeat: isClicked ? 0 : Infinity,
                repeatDelay: 3,
                ease: 'easeInOut',
              }}
              className={`absolute pointer-events-auto ${
                petal.isClickable && !isClicked
                  ? 'cursor-pointer hover:scale-110 transition-transform'
                  : ''
              }`}
              style={{
                left: `${petal.x}%`,
                top: `${petal.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              onClick={() => handlePetalClick(petal)}
              aria-label={petal.isClickable ? 'Click to visit petal shop' : undefined}
            >
              {/* Petal SVG */}
              <svg
                width="8"
                height="8"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={petal.isClickable && !isClicked ? 'drop-shadow-sm' : ''}
                style={{
                  filter:
                    petal.isClickable && !isClicked
                      ? 'drop-shadow(0 0 2px rgba(236, 72, 153, 0.3))'
                      : 'none',
                }}
              >
                <path
                  d="M12 2C12 2 8 6 8 10C8 14 12 18 12 18C12 18 16 14 16 10C16 6 12 2 12 2Z"
                  fill={
                    petal.isClickable && !isClicked
                      ? 'rgba(236, 72, 153, 0.4)'
                      : 'rgba(236, 72, 153, 0.25)'
                  }
                  stroke={
                    petal.isClickable && !isClicked
                      ? 'rgba(244, 114, 182, 0.3)'
                      : 'rgba(236, 72, 153, 0.2)'
                  }
                  strokeWidth="0.5"
                />
              </svg>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
