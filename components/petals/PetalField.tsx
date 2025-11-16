/**
 * PetalField Component
 * 
 * Sakura-style petal field using sprite sheet (cherrysprite.png)
 * - 4x3 grid (12 petals total)
 * - Clickable and collectible petals
 * - Integrates with petal economy system
 * 
 * Configuration:
 * - petalCount: Number of petals on screen (default: 30)
 * - speedMultiplier: Animation speed (default: 0.4, slow)
 * - hitRadius: Click detection radius in pixels (default: 30px)
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { usePetalContext } from '@/providers';

interface Petal {
  x: number;
  y: number;
  vx: number; // Horizontal velocity (left to right)
  vy: number; // Vertical velocity (downward)
  spriteIndex: number; // 0-11 (12 petals in sprite sheet)
  rotation: number;
  rotationSpeed: number;
  scale: number;
  alpha: number;
  collected: boolean;
  popAnimationProgress: number; // 0-1 for pop animation
}

interface PetalFieldProps {
  petalCount?: number; // Default: 30
  speedMultiplier?: number; // Default: 0.4 (slow)
  hitRadius?: number; // Default: 30px
  enabled?: boolean; // Toggle petal field on/off
  className?: string;
}

// Sprite sheet configuration
const SPRITE_COLS = 4;
const SPRITE_ROWS = 3;
const TOTAL_SPRITES = SPRITE_COLS * SPRITE_ROWS; // 12

// Guest petal storage key
const GUEST_PETAL_KEY = 'otm-guest-petals';

export default function PetalField({
  petalCount = 30,
  speedMultiplier = 0.4,
  hitRadius = 30,
  enabled = true,
  className = '',
}: PetalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get petal store - component must be wrapped in PetalProvider
  // Homepage is already wrapped in Providers (which includes PetalProvider)
  // If used elsewhere, wrap component in PetalProvider or it will throw
  const petalStore = usePetalContext();

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  // Load sprite sheet image
  useEffect(() => {
    if (!enabled || prefersReducedMotion) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = '/assets/images/cherrysprite.png';
    img.onload = () => {
      imageRef.current = img;
      setIsLoading(false);
    };
    img.onerror = () => {
      console.error('Failed to load petal sprite sheet');
      setIsLoading(false);
    };
  }, [enabled, prefersReducedMotion]);

  // Initialize petals
  const createPetal = useCallback((canvas: HTMLCanvasElement): Petal => {
    return {
      x: -50, // Start off-screen left
      y: Math.random() * canvas.height,
      vx: (0.5 + Math.random() * 0.5) * speedMultiplier, // Left to right, slow
      vy: (0.2 + Math.random() * 0.3) * speedMultiplier, // Gentle downward drift
      spriteIndex: Math.floor(Math.random() * TOTAL_SPRITES), // Random sprite (0-11)
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02, // Slow rotation
      scale: 0.8 + Math.random() * 0.4, // Vary size
      alpha: 0.7 + Math.random() * 0.3,
      collected: false,
      popAnimationProgress: 0,
    };
  }, [speedMultiplier]);

  // Handle petal collection
  const collectPetal = useCallback(async (petalIndex: number) => {
    const petal = petalsRef.current[petalIndex];
    if (!petal || petal.collected) return;

    // Mark as collected and start pop animation
    petal.collected = true;
    petal.popAnimationProgress = 0;

    // Call API to record collection
    try {
      const response = await fetch('/api/v1/petals/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1,
          source: 'homepage_collection',
        }),
      });

      const data = await response.json();

      if (data.ok && data.data) {
        if (data.data.isGuest) {
          // Handle guest petal storage
          const currentGuestPetals = parseInt(
            localStorage.getItem(GUEST_PETAL_KEY) || '0',
            10,
          );
          const newTotal = currentGuestPetals + data.data.guestPetals;
          localStorage.setItem(GUEST_PETAL_KEY, newTotal.toString());
          
          // Update Zustand store if available
          if (petalStore) {
            petalStore.getState().addPetals(data.data.guestPetals);
          }
        } else {
          // Authenticated user - balance is updated server-side
          // Update store with new balance
          if (petalStore && typeof data.data.balance === 'number') {
            petalStore.getState().setPetals(data.data.balance);
          }
        }
      }
    } catch (error) {
      console.error('Failed to collect petal:', error);
    }
  }, [petalStore]);

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || isLoading) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Find nearest petal within hit radius
      let nearestIndex = -1;
      let nearestDistance = hitRadius;

      petalsRef.current.forEach((petal, index) => {
        if (petal.collected || petal.popAnimationProgress > 0.5) return;

        const dx = clickX - petal.x;
        const dy = clickY - petal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      if (nearestIndex !== -1) {
        collectPetal(nearestIndex);
      }
    },
    [isLoading, hitRadius, collectPetal],
  );

  // Animation loop
  useEffect(() => {
    if (!enabled || prefersReducedMotion || isLoading || !imageRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize petals
    if (petalsRef.current.length === 0) {
      for (let i = 0; i < petalCount; i++) {
        petalsRef.current.push(createPetal(canvas));
      }
    }

    // Calculate sprite dimensions
    const spriteWidth = imageRef.current.width / SPRITE_COLS;
    const spriteHeight = imageRef.current.height / SPRITE_ROWS;

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach((petal, index) => {
        // Update position
        if (!petal.collected) {
          petal.x += petal.vx;
          petal.y += petal.vy;
          petal.rotation += petal.rotationSpeed;
        }

        // Update pop animation
        if (petal.collected) {
          petal.popAnimationProgress += 0.05;
          if (petal.popAnimationProgress >= 1) {
            // Reset petal after pop animation completes
            petalsRef.current[index] = createPetal(canvas);
            return;
          }
        }

        // Wrap around screen (re-spawn from left when off-screen right)
        if (petal.x > canvas.width + 50) {
          petal.x = -50;
          petal.y = Math.random() * canvas.height;
        }
        if (petal.y > canvas.height + 50) {
          petal.y = -50;
          petal.x = Math.random() * canvas.width;
        }

        // Calculate sprite source coordinates
        const spriteCol = petal.spriteIndex % SPRITE_COLS;
        const spriteRow = Math.floor(petal.spriteIndex / SPRITE_COLS);
        const sx = spriteCol * spriteWidth;
        const sy = spriteRow * spriteHeight;

        // Calculate pop animation transform
        const popScale = petal.collected
          ? 1 + petal.popAnimationProgress * 0.5 // Scale up during pop
          : 1;
        const popAlpha = petal.collected
          ? petal.alpha * (1 - petal.popAnimationProgress) // Fade out during pop
          : petal.alpha;

        // Draw petal
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        ctx.scale(petal.scale * popScale, petal.scale * popScale);
        ctx.globalAlpha = popAlpha;

        // Draw sprite from sprite sheet
        ctx.drawImage(
          imageRef.current!,
          sx,
          sy,
          spriteWidth,
          spriteHeight,
          -spriteWidth / 2,
          -spriteHeight / 2,
          spriteWidth,
          spriteHeight,
        );

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled, prefersReducedMotion, isLoading, petalCount, createPetal]);

  if (!enabled || prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className={`fixed inset-0 pointer-events-auto z-0 ${className}`}
      style={{
        background: 'transparent',
        cursor: 'pointer',
      }}
      aria-label="Interactive petal field - click petals to collect them"
    />
  );
}

