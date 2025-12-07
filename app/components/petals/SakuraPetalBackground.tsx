'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePetalCollection } from '@/app/hooks/usePetalCollection';
import type { TreeArea } from '@/app/hooks/useTreeCanopyArea';

/**
 * SakuraPetalBackground - Real sakura petals with physics and click-to-collect
 *
 * Features:
 * - Real petal shapes using Bézier curves (not circles/orbs)
 * - Proper physics: wind sway, rotation, gravity
 * - Clickable but non-intrusive (canvas has pointer-events: none)
 * - Spawns from tree canopy or above viewport, fades in smoothly
 * - Integrates with petal economy
 * - Respects prefers-reduced-motion
 */

export type SakuraPetal = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number; // rotation angle in radians
  spinSpeed: number; // rotation speed
  radius: number; // size scalar, always > 0
  life: number; // 0 → 1 (fade in/out), < 0 means dead
  collected: boolean;
};

interface SakuraPetalBackgroundProps {
  enabled?: boolean;
  maxPetals?: number;
  treeArea?: TreeArea;
  spawnInterval?: number; // milliseconds
  hitRadius?: number; // pixels
  onCollect?: (petalId: string, x: number, y: number) => void;

const DEFAULT_MAX_PETALS = 30;
const DEFAULT_SPAWN_INTERVAL = 2000; // 2 seconds
const DEFAULT_HIT_RADIUS = 32; // pixels
const PETAL_VALUE = 1; // petals per collection

/**
 * Spawn a new petal - invisible spawn, fades in smoothly
 */
function spawnPetal(width: number, height: number, treeArea?: TreeArea): SakuraPetal {
  const useTree = !!treeArea && Math.random() < 0.7; // 70% spawn around tree, 30% random top

  const x = useTree
    ? treeArea!.xMin + Math.random() * (treeArea!.xMax - treeArea!.xMin)
    : Math.random() * width;

  // If from tree: start somewhere inside canopy; else: just above viewport
  const y = useTree ? treeArea!.yMin + Math.random() * (treeArea!.yMax - treeArea!.yMin) : -40;

  const radius = 8 + Math.random() * 10; // 8-18px, clamped to prevent huge blobs

  return {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    x,
    y,
    vx: (Math.random() - 0.5) * 0.3, // slight horizontal drift
    vy: 0.4 + Math.random() * 0.5, // soft fall speed
    spin: Math.random() * Math.PI * 2, // random initial angle
    spinSpeed: (Math.random() - 0.5) * 0.002, // slow spin
    radius: Math.max(4, Math.min(18, radius)), // Clamp to safe range
    life: 0, // fade/scale in
    collected: false,
  };
}

/**
 * Update petal physics - wind + spin + fade
 */
function updatePetal(p: SakuraPetal, width: number, height: number, dt: number): SakuraPetal {
  // dt is normalized time step (typically ~16ms for 60fps)
  // Wind effect: sinusoidal sway based on y position and time
  const wind =
    Math.sin(
      p.y / 60 + (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000,
    ) * 0.18;

  let x = p.x + (p.vx + wind) * dt;
  let y = p.y + p.vy * dt;
  let spin = p.spin + p.spinSpeed * dt;
  let life = p.life;

  // Wrap x position (petals can drift off-screen and reappear)
  if (x < -50) x = width + 50;
  if (x > width + 50) x = -50;

  // Fade in
  if (!p.collected && life < 1) {
    life = Math.min(1, life + dt * 0.0015);
  }

  // If collected, fade out and shrink
  if (p.collected) {
    life -= dt * 0.0025;
    if (life <= 0) {
      // Mark as dead by setting life < 0; caller can respawn
      life = -1;
    }
  }

  // If it falls far below viewport, mark for respawn
  if (y > height + 60 && !p.collected) {
    life = -1;
  }

  return { ...p, x, y, spin, life };
}

/**
 * Draw an actual sakura petal shape using Bézier curves
 * Creates a teardrop/sakura petal shape, not a circle
 */
function drawPetal(ctx: CanvasRenderingContext2D, p: SakuraPetal) {
  // Guard: Ensure radius is valid
  let r = p.radius;
  if (!Number.isFinite(r) || r <= 0) return;
  if (p.life <= 0) return;

  const alpha = Math.min(1, Math.max(0, p.life));

  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.spin);

  // Subtle flutter by modulating scale
  const flutter =
    0.9 +
    Math.sin(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 220 + p.x * 0.01,
    ) *
      0.08;
  const scaleX = r * flutter;
  const scaleY =
    r *
    (0.6 +
      Math.sin(
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 350 + p.y * 0.02,
      ) *
        0.1);

  ctx.scale(scaleX, scaleY);
  ctx.globalAlpha = alpha * (p.collected ? 0.6 : 0.95);

  // Gradient fill to feel more "petal" - cherry blossom pink
  const grad = ctx.createLinearGradient(0, -1, 0, 1);
  grad.addColorStop(0, '#ffd7f0'); // light tip
  grad.addColorStop(1, '#f38bbd'); // deeper pink base

  ctx.fillStyle = grad;

  ctx.beginPath();
  // Top point
  ctx.moveTo(0, -1);
  // Right curve - creates petal shape
  ctx.bezierCurveTo(0.7, -0.4, 0.9, 0.2, 0.2, 0.9);
  // Left curve - mirrors right side
  ctx.bezierCurveTo(-0.9, 0.2, -0.7, -0.4, 0, -1);
  ctx.closePath();
  ctx.fill();

  // Optional: subtle 90s anime ink-line outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 0.05;
  ctx.stroke();

  ctx.restore();
}

/**
 * Handle click detection - find nearest petal within hit radius
 */
function handleClick(
  ev: MouseEvent,
  petals: SakuraPetal[],
  rect: DOMRect,
  hitRadius: number,
): SakuraPetal | null {
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;

  let bestPetal: SakuraPetal | null = null;
  let bestDist = Infinity;

  petals.forEach((p) => {
    if (p.collected || p.life <= 0) return;

    const dx = p.x - x;
    const dy = p.y - y;
    const dist = Math.hypot(dx, dy);

    if (dist < hitRadius && dist < bestDist) {
      bestDist = dist;
      bestPetal = p;
    }
  });

  return bestPetal;
}

export default function SakuraPetalBackground({
  enabled = true,
  maxPetals = DEFAULT_MAX_PETALS,
  treeArea: providedTreeArea,
  spawnInterval = DEFAULT_SPAWN_INTERVAL,
  hitRadius = DEFAULT_HIT_RADIUS,
  onCollect,
}: SakuraPetalBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const petalsRef = useRef<SakuraPetal[]>([]);
  const lastSpawnTimeRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { collectPetal } = usePetalCollection();

  // Use provided tree area or detect it dynamically
  const [detectedTreeArea, setDetectedTreeArea] = useState<TreeArea | undefined>(providedTreeArea);

  // Detect tree area if not provided
  useEffect(() => {
    if (providedTreeArea || typeof window === 'undefined') {
      setDetectedTreeArea(providedTreeArea);
      return;
    }

    const detectTreeArea = () => {
      const treeImg = document.querySelector(
        'img[alt="Cherry Blossom Tree"]',
      ) as HTMLImageElement | null;
      if (!treeImg) {
        // Fallback estimate based on typical tree position (left side, ~30% width)
        const width = window.innerWidth;
        const height = window.innerHeight;
        setDetectedTreeArea({
          xMin: width * 0.05,
          xMax: width * 0.35,
          yMin: height * 0.1,
          yMax: height * 0.4,
        });
        return;
      }

      const rect = treeImg.getBoundingClientRect();
      // Estimate canopy from tree image bounds (top 30% of tree height, left 60% of width)
      setDetectedTreeArea({
        xMin: rect.left,
        xMax: rect.left + rect.width * 0.6,
        yMin: rect.top,
        yMax: rect.top + rect.height * 0.3,
      });
    };

    const timeoutId = setTimeout(detectTreeArea, 200);
    window.addEventListener('resize', detectTreeArea);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', detectTreeArea);
    };
  }, [providedTreeArea]);

  const treeArea = providedTreeArea || detectedTreeArea;

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Handle click on container (not canvas - canvas has pointer-events: none)
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || !enabled) return;

      const rect = containerRef.current.getBoundingClientRect();
      const nativeEvent = e.nativeEvent as MouseEvent;
      const hit = handleClick(nativeEvent, petalsRef.current, rect, hitRadius);

      if (hit) {
        // Mark as collected
        petalsRef.current = petalsRef.current.map((p) =>
          p.id === hit.id ? { ...p, collected: true } : p,
        );

        // Trigger petal economy via centralized API
        const normalizedX = hit.x / rect.width;
        const normalizedY = hit.y / rect.height;

        // Use the centralized petal collection hook
        collectPetal(
          parseInt(hit.id.split('-')[0]) || Date.now(),
          PETAL_VALUE,
          normalizedX,
          normalizedY,
        );

        // Call optional callback
        if (onCollect) {
          onCollect(hit.id, hit.x, hit.y);
        }
      }
    },
    [enabled, hitRadius, collectPetal, onCollect],
  );

  // Main animation loop
  useEffect(() => {
    if (!enabled || prefersReducedMotion || !canvasRef.current) {
      // For reduced motion, show static arrangement
      if (prefersReducedMotion && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          // Draw a few static petals
          for (let i = 0; i < 5; i++) {
            const staticPetal: SakuraPetal = {
              id: `static-${i}`,
              x: (window.innerWidth / 6) * (i + 1),
              y: (window.innerHeight / 4) * (i % 2 === 0 ? 1 : 3),
              vx: 0,
              vy: 0,
              spin: (Math.PI / 5) * i,
              spinSpeed: 0,
              radius: 10,
              life: 0.6,
              collected: false,
            };
            drawPetal(ctx, staticPetal);
          }
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let running = true;

    // Resize canvas to match viewport
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = (currentTime: number) => {
      if (!running) return;

      const dt = Math.min((currentTime - lastTime) / 16.67, 2); // Cap at 2x for lag
      lastTime = currentTime;

      const width = canvas.width;
      const height = canvas.height;

      // Spawn new petals
      if (
        petalsRef.current.length < maxPetals &&
        currentTime - lastSpawnTimeRef.current > spawnInterval
      ) {
        petalsRef.current.push(spawnPetal(width, height, treeArea));
        lastSpawnTimeRef.current = currentTime;
      }

      // Update all petals
      petalsRef.current = petalsRef.current
        .map((p) => updatePetal(p, width, height, dt))
        .filter((p) => p.life > 0); // Remove dead petals

      // Maintain target count by respawning dead ones
      while (
        petalsRef.current.length < maxPetals &&
        currentTime - lastSpawnTimeRef.current > spawnInterval / 2
      ) {
        petalsRef.current.push(spawnPetal(width, height, treeArea));
        lastSpawnTimeRef.current = currentTime;
      }

      // Clear and draw
      ctx.clearRect(0, 0, width, height);
      petalsRef.current.forEach((p) => drawPetal(ctx, p));

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    enabled,
    prefersReducedMotion,
    maxPetals,
    spawnInterval,
    treeArea,
    hitRadius,
    collectPetal,
    onCollect,
  ]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-auto"
      style={{ zIndex: -5 }}
      onClick={handleContainerClick}
      aria-hidden="true"
     role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.currentTarget.click(); }}>
      {/* 
        Layering strategy for non-blocking petal collection:
        - Container has pointer-events-auto to receive clicks (z-index: -5, below main content)
        - Canvas has pointer-events-none so it doesn't block UI interactions
        - Click handler uses small hit radius (32px default) to avoid interfering with links/buttons
        - z-index -5 ensures petals are behind main content (z-index 10+) but above backgrounds (z-index -10)
      */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 w-full h-full"
        aria-hidden="true"
      />
    </div>
  );
}
