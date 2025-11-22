/**
 * Enhanced PetalField Component
 * 
 * Sakura-style petal field with:
 * - Tree-matched color palette
 * - Sprite sheet rendering (cherrysprite2.png, 4x3 grid)
 * - Wabi-sabi motion (flutter system, flipX, natural physics)
 * - Click detection and petal collection
 * - Slower, more natural movement
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface PetalFieldProps {
  density?: 'auth' | 'site' | 'home';
}

// Sprite sheet configuration
const SPRITE_COLS = 4;
const SPRITE_ROWS = 3;
const TOTAL_SPRITES = SPRITE_COLS * SPRITE_ROWS; // 12

interface Petal {
  id: string;
  x: number;
  y: number;
  vx: number; // Horizontal velocity
  vy: number; // Vertical velocity
  rotation: number; // Current rotation in radians
  rotationSpeed: number; // Rotation speed per frame
  scale: number; // Size multiplier
  opacity: number;
  frameIndex: number; // 0-11 for sprite selection
  flipX: number; // 1 or -1 for horizontal flip
  // Wabi-sabi flutter system
  flutterCooldown: number; // Time until next flutter (ms)
  flutterTime: number; // Current flutter duration (ms, 0 if not fluttering)
  // Physics
  gravity: number; // Base gravity
  windSeed: number; // Random seed for wind variation
  collected: boolean;
  collectAnimation: number; // 0-1 for collection animation
}

export default function PetalField({ density = 'site' }: PetalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Petal configuration based on density
  const config = {
    auth: { count: 8, speed: 0.3, size: 0.8 },
    site: { count: 12, speed: 0.2, size: 1.0 },
    home: { count: 25, speed: 0.15, size: 1.2 }, // Slower for home
  };

  const { count, speed, size } = config[density];

  // Load sprite sheet
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsLoading(false);
      return;
    }

    const img = new Image();
    img.src = '/assets/images/cherrysprite2.png';
    img.onload = () => {
      imageRef.current = img;
      setIsLoading(false);
    };
    img.onerror = () => {
      console.warn('Failed to load petal sprite sheet, using fallback rendering');
      setIsLoading(false);
    };
  }, [prefersReducedMotion]);

  // Create a new petal with wabi-sabi properties
  const createPetal = useCallback((canvas: HTMLCanvasElement): Petal => {
    const windSeed = Math.random();
    const frameIndex = Math.floor(Math.random() * TOTAL_SPRITES);

    return {
      id: `petal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      // Spawn from top or left side (natural entry points)
      x: Math.random() < 0.5 ? -20 : Math.random() * canvas.width,
      y: Math.random() < 0.5 ? Math.random() * canvas.height * 0.3 : -20,
      // Slower, more natural velocities
      vx: (Math.random() - 0.5) * 0.2 * speed, // Subtle horizontal drift
      vy: (0.05 + Math.random() * 0.1) * speed, // Soft gravity
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.008, // Slow rotation
      scale: (0.6 + Math.random() * 0.4) * size,
      opacity: 0.3 + Math.random() * 0.4, // Subtle visibility
      frameIndex,
      flipX: Math.random() < 0.5 ? 1 : -1,
      // Flutter system
      flutterCooldown: 1000 + Math.random() * 2500, // 1-3.5s
      flutterTime: 0,
      // Physics
      gravity: 0.05 + Math.random() * 0.05, // 0.05-0.1
      windSeed,
      collected: false,
      collectAnimation: 0,
    };
  }, [speed, size]);

  // Handle petal collection
  const collectPetal = useCallback(async (petalIndex: number) => {
    const petal = petalsRef.current[petalIndex];
    if (!petal || petal.collected) return;

    // Mark as collected and start animation
    petal.collected = true;
    petal.collectAnimation = 0;

    // Track petal collection for analytics
    const { trackPetalCollection } = await import('@/app/lib/analytics/petals');
    trackPetalCollection({
      petalId: petal.id,
      amount: 1,
      source: 'homepage_collection',
      location: { x: petal.x, y: petal.y },
      metadata: {
        frameIndex: petal.frameIndex,
        density,
      },
    });

    try {
      const response = await fetch('/api/v1/petals/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 1,
          source: 'homepage_collection',
          metadata: {
            petalId: petal.id,
            frameIndex: petal.frameIndex,
          },
        }),
      });

      const data = await response.json();

      if (data.ok && data.data) {
        const { balance, earned = 1, lifetimeEarned } = data.data;

        // Track petal milestone if reached
        if (lifetimeEarned && typeof lifetimeEarned === 'number') {
          const milestones = [10, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
          const reachedMilestone = milestones.find((m) => lifetimeEarned >= m && lifetimeEarned - earned < m);
          if (reachedMilestone) {
            const { trackPetalMilestone } = await import('@/app/lib/analytics/petals');
            trackPetalMilestone(reachedMilestone, lifetimeEarned, 'homepage_collection');
          }
        }

        // Dispatch petal:earn event for HUD
        window.dispatchEvent(
          new CustomEvent('petal:earn', {
            detail: {
              balance,
              granted: earned,
              lifetimePetalsEarned: lifetimeEarned,
              isGuest: data.data.isGuest || false,
            },
          }),
        );

        // Show collection effect (small +1 or sparkle)
        // This will be handled by the collection animation
      }
    } catch (error) {
      console.error('Failed to collect petal:', error);
    }
  }, [density]);

  // Handle canvas click
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || isLoading) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Find nearest petal within hit radius (forgiving hitbox)
      const hitRadius = 40;
      let nearestIndex = -1;
      let nearestDistance = hitRadius;

      petalsRef.current.forEach((petal, index) => {
        if (petal.collected || petal.collectAnimation > 0.3) return;

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
    [isLoading, collectPetal],
  );

  // Main animation loop
  useEffect(() => {
    if (prefersReducedMotion || isLoading || !imageRef.current) {
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
      for (let i = 0; i < count; i++) {
        petalsRef.current.push(createPetal(canvas));
      }
    }

    // Calculate sprite dimensions
    const spriteWidth = imageRef.current.width / SPRITE_COLS;
    const spriteHeight = imageRef.current.height / SPRITE_ROWS;

    // Animation loop
    let lastTime = performance.now();
    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2); // Cap at 2x for lag
      lastTime = currentTime;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach((petal, index) => {
        // Update flutter system
        if (petal.flutterTime > 0) {
          petal.flutterTime -= deltaTime * 16.67; // Convert to ms
          if (petal.flutterTime <= 0) {
            // Flutter ended, set new cooldown
            petal.flutterCooldown = 1000 + Math.random() * 2500;
          }
        } else {
          petal.flutterCooldown -= deltaTime * 16.67;
          if (petal.flutterCooldown <= 0) {
            // Start flutter
            petal.flutterTime = 300 + Math.random() * 400; // 300-700ms flutter
            // 40% chance to flip
            if (Math.random() < 0.4) {
              petal.flipX *= -1;
            }
          }
        }

        // Update physics
        if (!petal.collected) {
          // Wind effect (subtle horizontal sway)
          const windTime = currentTime * 0.001;
          const windEffect = Math.sin((windTime * 0.5 + petal.windSeed * 10) * 2) * 0.1;
          petal.vx += windEffect * speed * deltaTime;

          // Gravity
          petal.vy += petal.gravity * deltaTime;

          // Flutter effects
          if (petal.flutterTime > 0) {
            // Upward lift during flutter
            petal.vy -= 0.15 * deltaTime;
            // Increased sideways wobble
            petal.vx += (Math.random() - 0.5) * 0.3 * deltaTime;
            // Rotation speed adjustment
            petal.rotationSpeed += (Math.random() - 0.5) * 0.01 * deltaTime;
          }

          // Air resistance (damping)
          petal.vx *= 0.995;
          petal.vy *= 0.998;

          // Update position
          petal.x += petal.vx * deltaTime * 60;
          petal.y += petal.vy * deltaTime * 60;
          petal.rotation += petal.rotationSpeed * deltaTime;

          // Wrap around screen edges
          if (petal.x > canvas.width + 50) {
            petal.x = -50;
            petal.y = Math.random() * canvas.height * 0.3;
          }
          if (petal.x < -50) {
            petal.x = canvas.width + 50;
            petal.y = Math.random() * canvas.height * 0.3;
          }
          if (petal.y > canvas.height + 50) {
            petal.y = -50;
            petal.x = Math.random() * canvas.width;
          }
        } else {
          // Collection animation
          petal.collectAnimation += deltaTime * 0.1;
          if (petal.collectAnimation >= 1) {
            // Reset petal after animation
            petalsRef.current[index] = createPetal(canvas);
            return;
          }
        }

        // Calculate sprite coordinates
        const spriteCol = petal.frameIndex % SPRITE_COLS;
        const spriteRow = Math.floor(petal.frameIndex / SPRITE_COLS);
        const sx = spriteCol * spriteWidth;
        const sy = spriteRow * spriteHeight;

        // Collection animation transform
        const collectScale = petal.collected
          ? 1 + petal.collectAnimation * 1.5 // Scale up during collection
          : 1;
        const collectAlpha = petal.collected
          ? petal.opacity * (1 - petal.collectAnimation) // Fade out
          : petal.opacity;

        // Draw petal
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        ctx.scale(petal.scale * collectScale * petal.flipX, petal.scale * collectScale);
        ctx.globalAlpha = collectAlpha;

        // Draw sprite from sprite sheet
        const drawWidth = spriteWidth * 0.15; // Scale down sprite (15% of original)
        const drawHeight = spriteHeight * 0.15;
        ctx.drawImage(
          imageRef.current!,
          sx,
          sy,
          spriteWidth,
          spriteHeight,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight,
        );

        // Draw collection effect (+1 sparkle)
        if (petal.collected && petal.collectAnimation < 0.5) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, petal.x, petal.y - petal.collectAnimation * 30);
          ctx.globalAlpha = (1 - petal.collectAnimation * 2) * 0.9;
          ctx.fillStyle = '#FF4FA3';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('+1', 0, 0);
          ctx.restore();
        }

        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prefersReducedMotion, isLoading, count, createPetal, speed]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      onClick={handleCanvasClick}
      className="fixed inset-0 pointer-events-auto z-0"
      style={{
        background: 'transparent',
        cursor: 'pointer',
      }}
      aria-label="Interactive sakura petal field - click petals to collect them"
    />
  );
}
