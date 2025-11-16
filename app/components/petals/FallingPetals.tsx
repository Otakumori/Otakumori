'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  createPetal,
  updatePetalPhysics,
  shouldRemovePetal,
  isPointInPetal,
  calculateCollectionAnimation,
  generateSparkles,
  type Petal,
  type Position,
} from '@/app/lib/petals/physics';
import { SPAWN, PETAL_VALUES, COLORS, UI } from '@/app/lib/petals/constants';
import { getPetalColor } from '@/app/lib/petals/seasonDetection';

interface FallingPetalsProps {
  onPetalCollect: (petalId: number, value: number, x: number, y: number) => void;
  counterPosition?: Position;
}

interface Sparkle extends Position {
  id: number;
  opacity: number;
  life: number;
}

export default function FallingPetals({ onPetalCollect, counterPosition }: FallingPetalsProps) {
  const [petals, setPetals] = useState<Petal[]>([]);
  const [_sparkles, setSparkles] = useState<Sparkle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastSpawnTimeRef = useRef(0);
  const petalIdCounter = useRef(0);
  const startTimeRef = useRef(Date.now());
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Get counter position for collection animation target
  const getCounterPosition = useCallback((): Position => {
    if (counterPosition) return counterPosition;

    // Default to bottom-right corner
    return {
      x: window.innerWidth - UI.COUNTER_BOTTOM_RIGHT_MARGIN - 30,
      y: window.innerHeight - UI.COUNTER_BOTTOM_RIGHT_MARGIN - 16,
    };
  }, [counterPosition]);

  // Handle petal click
  const handlePetalClick = useCallback(
    (petal: Petal) => {
      if (petal.isCollecting) return;

      // Mark petal as collecting
      setPetals((prev) =>
        prev.map((p) =>
          p.id === petal.id
            ? {
                ...p,
                isCollecting: true,
                collectionProgress: 0,
              }
            : p,
        ),
      );

      // Spawn sparkles
      const sparklePositions = generateSparkles({ x: petal.x, y: petal.y }, UI.SPARKLE_COUNT);
      const newSparkles = sparklePositions.map((pos, i) => ({
        ...pos,
        id: Date.now() + i,
        opacity: 1,
        life: 1,
      }));
      setSparkles((prev) => [...prev, ...newSparkles]);

      // Notify parent
      onPetalCollect(petal.id, petal.value, petal.x, petal.y);
    },
    [onPetalCollect],
  );

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickPos: Position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Find clicked petal (check in reverse order for top-most)
      for (let i = petals.length - 1; i >= 0; i--) {
        const petal = petals[i];
        if (!petal.isCollecting && isPointInPetal(clickPos, petal)) {
          handlePetalClick(petal);
          break;
        }
      }
    },
    [petals, handlePetalClick],
  );

  // Spawn new petals
  const spawnPetal = useCallback(() => {
    const currentPetalColor = getPetalColor();
    const isRare = Math.random() < SPAWN.RARE_CHANCE;
    const color = isRare ? COLORS.RARE : currentPetalColor;
    const value = isRare ? PETAL_VALUES.RARE : PETAL_VALUES.COMMON;

    const newPetal = createPetal(petalIdCounter.current++, color, isRare, value);
    setPetals((prev) => [...prev, newPetal]);
  }, []);

  // Spawn initial petals on mount
  useEffect(() => {
    if (prefersReducedMotion) return;

    // Spawn 5 initial petals immediately
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        spawnPetal();
      }, i * 200);
    }
  }, [prefersReducedMotion, spawnPetal]);

  // Main animation loop
  useEffect(() => {
    if (prefersReducedMotion || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastFrameTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = Math.min((now - lastFrameTime) / 16.67, 2); // Cap at 2x for lag
      lastFrameTime = now;
      const time = now - startTimeRef.current;

      // Resize canvas to match window
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn new petals
      if (
        petals.length < SPAWN.MAX_PETALS &&
        now - lastSpawnTimeRef.current > SPAWN.SPAWN_INTERVAL
      ) {
        spawnPetal();
        lastSpawnTimeRef.current = now;
      }

      // Update and draw petals
      setPetals((prevPetals) => {
        const updatedPetals = prevPetals
          .map((petal) => {
            // Handle collection animation
            if (petal.isCollecting && petal.collectionProgress !== undefined) {
              const newProgress = Math.min(1, petal.collectionProgress + deltaTime / 36); // 600ms total

              if (newProgress >= 1) {
                return null; // Remove petal
              }

              const animationUpdate = calculateCollectionAnimation(
                petal,
                newProgress,
                getCounterPosition(),
              );

              return {
                ...petal,
                ...animationUpdate,
                collectionProgress: newProgress,
              };
            }

            // Normal physics update
            const updated = updatePetalPhysics(petal, time, deltaTime);

            // Remove if off screen
            if (shouldRemovePetal(updated)) {
              return null;
            }

            return updated;
          })
          .filter((p): p is Petal => p !== null);

        // Draw petals
        updatedPetals.forEach((petal) => {
          ctx.save();
          ctx.translate(petal.x, petal.y);
          ctx.rotate((petal.rotation * Math.PI) / 180);
          ctx.globalAlpha = petal.opacity;

          // Draw petal shape (ellipse) - reduced size for subtle aesthetic
          ctx.fillStyle = petal.color;
          ctx.beginPath();
          // Scale down: 4-6px radius instead of 8-12px (50% reduction)
          ctx.ellipse(0, 0, 4 * petal.scale, 6 * petal.scale, 0, 0, Math.PI * 2);
          ctx.fill();

          // Add glow for rare petals
          if (petal.isRare) {
            ctx.strokeStyle = COLORS.RARE_GLOW;
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          ctx.restore();
        });

        return updatedPetals;
      });

      // Update and draw sparkles
      setSparkles((prevSparkles) => {
        const updatedSparkles = prevSparkles
          .map((sparkle) => ({
            ...sparkle,
            life: sparkle.life - 0.02 * deltaTime,
            opacity: Math.max(0, sparkle.life),
            y: sparkle.y - 1 * deltaTime,
          }))
          .filter((s) => s.life > 0);

        // Draw sparkles
        updatedSparkles.forEach((sparkle) => {
          ctx.save();
          ctx.globalAlpha = sparkle.opacity;
          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(sparkle.x, sparkle.y, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        return updatedSparkles;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prefersReducedMotion, petals.length, spawnPetal, getCounterPosition]);

  // Don't render if reduced motion is preferred
  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="fixed inset-0 pointer-events-auto cursor-pointer"
      style={{ zIndex: 5 }}
      aria-label="Falling cherry blossom petals - click to collect"
    />
  );
}
