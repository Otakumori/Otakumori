'use client';

import { useEffect, useRef } from 'react';

type PetalLayer = 'near' | 'far';

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
  layer: PetalLayer;
  }

interface SakuraPetalFieldProps {
  petalCount?: number;
}

/**
 * SakuraPetalField - Unified sakura petal animation with two coordinated depth layers
 *
 * Features:
 * - Single canvas with two logical layers (near/far) for depth perception
 * - Coordinated physics system with consistent wind effect
 * - Dreamy, fluent motion (no jittery fast "storm")
 * - Respects prefers-reduced-motion
 * - Proper cleanup on unmount
 */
export function SakuraPetalField({ petalCount = 90 }: SakuraPetalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Initialize petals with two depth layers
    const petals: Petal[] = [];
    const nearRatio = 0.45; // ~45% near, 55% far

    for (let i = 0; i < petalCount; i++) {
      const layer: PetalLayer = Math.random() < nearRatio ? 'near' : 'far';
      petals.push(createPetal(canvas.width, canvas.height, layer));
    }

    petalsRef.current = petals;

    let lastTime = performance.now();
    let running = true;

    const loop = (now: number) => {
      if (!running) return;

      const dt = (now - lastTime) / 1000; // seconds
      lastTime = now;

      updatePetals(petalsRef.current, canvas.width, canvas.height, dt);
      drawPetals(ctx, petalsRef.current, canvas.width, canvas.height);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, [petalCount]);

  // Check for reduced motion preference for render
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-screen h-screen pointer-events-none"
      style={{ zIndex: -5, background: 'transparent', cursor: 'default' }}
      aria-label="Interactive sakura petal field - click petals to collect them"
    />
  );
}

/**
 * Create a new petal with properties based on its layer
 */
function createPetal(width: number, height: number, layer: PetalLayer): Petal {
  const isNear = layer === 'near';

  const baseSize = isNear ? 12 : 7;
  const sizeJitter = isNear ? 6 : 4;

  const baseVy = isNear ? 40 : 20; // px/s
  const vyJitter = isNear ? 25 : 15;

  const baseVx = isNear ? 10 : 5;
  const vxJitter = isNear ? 12 : 8;

  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (isNear ? 1 : 0.7) * baseVx + (Math.random() - 0.5) * vxJitter,
    vy: baseVy + Math.random() * vyJitter,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * (isNear ? 0.8 : 0.4),
    size: baseSize + Math.random() * sizeJitter,
    opacity: isNear ? 0.9 : 0.55,
    layer,
  };
}

/**
 * Respawn a petal from the top when it falls off screen
 */
function respawnPetal(petal: Petal, width: number, height: number) {
  const layer = petal.layer;
  const isNear = layer === 'near';
  const baseSize = isNear ? 12 : 7;
  const sizeJitter = isNear ? 6 : 4;
  const baseVy = isNear ? 40 : 20;
  const vyJitter = isNear ? 25 : 15;
  const baseVx = isNear ? 10 : 5;
  const vxJitter = isNear ? 12 : 8;

  petal.x = Math.random() * width;
  petal.y = -20; // respawn above the top
  petal.vx = (isNear ? 1 : 0.7) * baseVx + (Math.random() - 0.5) * vxJitter;
  petal.vy = baseVy + Math.random() * vyJitter;
  petal.rotation = Math.random() * Math.PI * 2;
  petal.rotationSpeed = (Math.random() - 0.5) * (isNear ? 0.8 : 0.4);
  petal.size = baseSize + Math.random() * sizeJitter;
  petal.opacity = isNear ? 0.9 : 0.55;
}

/**
 * Update petal physics with coordinated wind effect
 */
function updatePetals(
  petals: Petal[],
  width: number,
  height: number,
  dt: number,
) {
  // Shared wind effect - gentle horizontal drift
  const wind = Math.sin(performance.now() / 6000) * 4;

  for (const p of petals) {
    p.x += (p.vx + wind) * dt;
    p.y += p.vy * dt;
    p.rotation += p.rotationSpeed * dt;

    // Wrap horizontally
    if (p.x < -50) p.x = width + 50;
    if (p.x > width + 50) p.x = -50;

    // Respawn when off bottom
    if (p.y > height + 50) {
      respawnPetal(p, width, height);
    }
  }
}

/**
 * Draw petals with proper depth layering (far first, then near)
 */
function drawPetals(
  ctx: CanvasRenderingContext2D,
  petals: Petal[],
  width: number,
  height: number,
) {
  ctx.clearRect(0, 0, width, height);

  // Separate petals by layer
  const far = petals.filter((p) => p.layer === 'far');
  const near = petals.filter((p) => p.layer === 'near');

  // Draw far layer first, then near (proper depth)
  const drawSet = (set: Petal[]) => {
    for (const p of set) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // Pink gradient matching tree aesthetic
      const gradient = ctx.createLinearGradient(
        -p.size,
        -p.size,
        p.size,
        p.size,
      );
      gradient.addColorStop(0, `rgba(244, 114, 182, ${p.opacity * 0.95})`);
      gradient.addColorStop(1, `rgba(219, 39, 119, ${p.opacity})`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  };

  drawSet(far);
  drawSet(near);
}

