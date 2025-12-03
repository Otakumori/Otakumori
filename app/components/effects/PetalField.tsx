/**
 * Enhanced PetalField Component
 *
 * Sakura-style petal field with:
 * - Dark aesthetic matching CherryPetalLayer (subtle, discoverable)
 * - Tree-matched color palette
 * - Sprite sheet rendering (cherrysprite2.png, 4x3 grid)
 * - Wabi-sabi motion (flutter system, flipX, natural physics)
 * - Video game particle effects (glow, trails, collectible cues)
 * - Click detection and petal collection
 * - Slower, more natural movement
 */

'use client';

import React from 'react';
import { logger } from '@/app/lib/logger';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

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
  // Video game particle effects
  isClickable: boolean; // Secret collectible status
  glowPhase: number; // 0-1 for pulsing glow
  trail: Array<{ x: number; y: number; opacity: number; time: number }>; // Particle trail
}

export default function PetalField({ density = 'site' }: PetalFieldProps) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const clickedPetalIdsRef = useRef<Set<string>>(new Set());

  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined'
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
      logger.warn('Failed to load petal sprite sheet, using fallback rendering');
      setIsLoading(false);
    };
  }, [prefersReducedMotion]);

  // Create a new petal with wabi-sabi properties and dark aesthetic
  const createPetal = useCallback(
    (canvas: HTMLCanvasElement): Petal => {
      const windSeed = Math.random();
      const frameIndex = Math.floor(Math.random() * TOTAL_SPRITES);
      const isClickable = Math.random() < 0.35; // 35% are secret collectibles

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
        // Dark aesthetic: lower opacity like CherryPetalLayer (0.2-0.35)
        opacity: isClickable
          ? 0.3 + Math.random() * 0.1 // 0.3-0.4 for clickable (slightly more visible)
          : 0.2 + Math.random() * 0.08, // 0.2-0.28 for non-clickable
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
        // Video game particle effects
        isClickable,
        glowPhase: Math.random() * Math.PI * 2, // Random glow phase
        trail: [], // Empty trail to start
      };
    },
    [speed, size],
  );

  // Handle petal collection (unused - kept for potential future use)
  const _collectPetal = useCallback(
    async (petalIndex: number) => {
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
            const reachedMilestone = milestones.find(
              (m) => lifetimeEarned >= m && lifetimeEarned - earned < m,
            );
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
        logger.error(
          'Failed to collect petal',
          {
            extra: {
              section: 'petalField',
              operation: 'collectPetal',
            },
          },
          undefined,
          error instanceof Error ? error : new Error(String(error)),
        );
      }
    },
    [density],
  );

  // Handle canvas click - navigate to petal-shop like CherryPetalLayer
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current || isLoading) return;

      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Find nearest clickable petal within hit radius (forgiving hitbox)
      const hitRadius = 40;
      let nearestIndex = -1;
      let nearestDistance = hitRadius;

      for (let index = 0; index < petalsRef.current.length; index++) {
        const petal = petalsRef.current[index];
        if (!petal.isClickable || petal.collected || petal.collectAnimation > 0.3) continue;
        if (clickedPetalIdsRef.current.has(petal.id)) continue;

        const dx = clickX - petal.x;
        const dy = clickY - petal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      }

      if (nearestIndex !== -1) {
        const clickedPetal = petalsRef.current[nearestIndex];
        if (!clickedPetal) return;

        // Mark as clicked
        clickedPetalIdsRef.current.add(clickedPetal.id);

        // Trigger collection animation (visual feedback)
        const petalToAnimate = petalsRef.current[nearestIndex];
        if (petalToAnimate) {
          petalToAnimate.collected = true;
          petalToAnimate.collectAnimation = 0;
        }

        // Navigate to petal-shop after brief delay (like CherryPetalLayer)
        setTimeout(() => {
          router.push('/petal-shop');
        }, 200);
      }
    },
    [isLoading, router],
  );

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLCanvasElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Simulate click at center of canvas
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          const syntheticEvent = {
            clientX: rect.left + canvas.width / 2,
            clientY: rect.top + canvas.height / 2,
          } as React.MouseEvent<HTMLCanvasElement>;
          handleCanvasClick(syntheticEvent);
        }
      }
    },
    [handleCanvasClick],
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

    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

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
        // Update glow phase for pulsing effect (only for clickable petals)
        if (petal.isClickable && !petal.collected) {
          petal.glowPhase += deltaTime * 0.003; // Slow pulse
          if (petal.glowPhase > Math.PI * 2) petal.glowPhase -= Math.PI * 2;
        }

        // Update trail for video game particle effect
        if (petal.isClickable && !petal.collected) {
          // Add current position to trail
          petal.trail.push({
            x: petal.x,
            y: petal.y,
            opacity: petal.opacity * 0.5, // Trail is half opacity
            time: currentTime,
          });

          // Remove old trail points (keep last 8)
          if (petal.trail.length > 8) {
            petal.trail.shift();
          }

          // Fade trail points over time
          petal.trail.forEach((point) => {
            const age = (currentTime - point.time) / 1000; // Age in seconds
            point.opacity = Math.max(0, point.opacity * (1 - age * 0.5)); // Fade out over 2 seconds
          });
        }

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
            // Reset trail when wrapping
            petal.trail = [];
          }
          if (petal.x < -50) {
            petal.x = canvas.width + 50;
            petal.y = Math.random() * canvas.height * 0.3;
            petal.trail = [];
          }
          if (petal.y > canvas.height + 50) {
            petal.y = -50;
            petal.x = Math.random() * canvas.width;
            petal.trail = [];
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

        // Draw trail for clickable petals (video game particle effect)
        if (petal.isClickable && !petal.collected && petal.trail.length > 1) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen'; // Additive blending for glow

          for (let i = 1; i < petal.trail.length; i++) {
            const prev = petal.trail[i - 1];
            const curr = petal.trail[i];

            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);

            // Gradient trail opacity
            const trailOpacity = curr.opacity * 0.3;
            ctx.strokeStyle = `rgba(236, 72, 153, ${trailOpacity})`; // Pink glow
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.stroke();
          }

          ctx.restore();
        }

        // Draw petal
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        ctx.scale(petal.scale * collectScale * petal.flipX, petal.scale * collectScale);

        // Video game glow effect for clickable petals
        if (petal.isClickable && !petal.collected) {
          const glowIntensity = 0.3 + Math.sin(petal.glowPhase) * 0.2; // Pulse between 0.3-0.5
          ctx.shadowBlur = 8;
          ctx.shadowColor = `rgba(236, 72, 153, ${glowIntensity})`; // Pink glow matching CherryPetalLayer
        }

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

        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';

        // Draw collection effect (+1 sparkle with game-style particle burst)
        if (petal.collected && petal.collectAnimation < 0.5) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, petal.x, petal.y - petal.collectAnimation * 30);

          // Pulsing glow during collection
          const collectGlow = 1 - petal.collectAnimation * 2;
          ctx.globalAlpha = collectGlow * 0.9;
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'rgba(236, 72, 153, 0.8)';

          // Game-style +1 text
          ctx.fillStyle = '#FF4FA3';
          ctx.font = 'bold 18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('+1', 0, 0);

          // Particle sparkles around the +1
          const sparkleCount = 6;
          for (let i = 0; i < sparkleCount; i++) {
            const angle = (i / sparkleCount) * Math.PI * 2 + petal.collectAnimation * 10;
            const distance = petal.collectAnimation * 25;
            const sparkleX = Math.cos(angle) * distance;
            const sparkleY = Math.sin(angle) * distance;

            ctx.fillStyle = `rgba(255, 255, 255, ${collectGlow * 0.8})`;
            ctx.fillRect(sparkleX - 1, sparkleY - 1, 2, 2);
          }

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
        cursor: 'default', // No obvious clickability cue - discoverable through interaction
      }}
      aria-label="Interactive sakura petal field - click petals to navigate to petal shop"
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    />
  );
}