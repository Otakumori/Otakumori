'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePetalCollection } from '@/app/hooks/usePetalCollection';

/**
 * HomeHeroPetals - Clickable sakura petals falling from left tree canopy
 *
 * Features:
 * - Petals fall from left tree canopy area only
 * - Desktop: Overlay covers left 0-45% of hero width
 * - Mobile: Overlay covers top 40-50% where tree is
 * - Clickable currency collection
 * - First collection triggers counter reveal + one-time tooltip
 * - Calm, non-intrusive animation
 */

interface Petal {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  opacity: number;
  life: number; // 0-1, fades out in final 20%
  collected: boolean;
  color: string;
  }

const PETAL_COLORS = ['#d4a5a5', '#c99999', '#d8b0b0']; // Muted rose matching tree
const PETAL_OPACITY_MIN = 0.25; // Lighter opacity for subtle effect
const PETAL_OPACITY_MAX = 0.45;
const LIFETIME_MIN = 10000; // 10 seconds - slower, more natural
const LIFETIME_MAX = 14000; // 14 seconds
const FADE_OUT_START = 0.8; // Start fading at 80% of lifetime

export default function HomeHeroPetals() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const lastSpawnTimeRef = useRef(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasSeenTooltip, setHasSeenTooltip] = useState(false);
  const { collectPetal, hasCollectedAny, dismissAchievement } = usePetalCollection();

  // Check if user has seen tooltip before
  useEffect(() => {
    const seen = localStorage.getItem('otm-petal-tooltip-seen') === 'true';
    setHasSeenTooltip(seen);
  }, []);

  // Update dimensions and mobile state
  useEffect(() => {
    const updateDimensions = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
      setIsMobile(window.innerWidth < 768);
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Spawn a new petal
  const spawnPetal = useCallback((): Petal => {
    const { width, height } = dimensions;
    if (width === 0 || height === 0) {
      // Return a default petal that won't render
      return {
        id: `${Date.now()}-${Math.random()}`,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        rotation: 0,
        rotationSpeed: 0,
        size: 0,
        opacity: 0,
        life: 0,
        collected: false,
        color: PETAL_COLORS[0],
      };
    }

    // Desktop: spawnX 0.0-0.4, spawnY 0.0-0.35
    // Mobile: spawnX 0.1-0.9, spawnY 0.0-0.4
    const spawnX = isMobile ? 0.1 + Math.random() * 0.8 : Math.random() * 0.4;
    const spawnY = isMobile ? Math.random() * 0.4 : Math.random() * 0.35;

    const desiredFallTime = 12000; // 12 seconds - slower, more realistic
    const baseVY = height / desiredFallTime;
    const vy = baseVY * (0.7 + Math.random() * 0.3); // 0.7-1.0x - gentler variation

    return {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      x: width * spawnX,
      y: height * spawnY,
      vx: (Math.random() - 0.5) * 0.15, // even gentler horizontal drift
      vy,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.002, // slower rotation
      size: 8 + Math.random() * 8, // 8-16px
      opacity: PETAL_OPACITY_MIN + Math.random() * (PETAL_OPACITY_MAX - PETAL_OPACITY_MIN),
      life: 1,
      collected: false,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    };
  }, [dimensions, isMobile]);

  // Calculate max petals based on dimensions
  const getMaxPetals = useCallback((): number => {
    const { width, height } = dimensions;
    if (width === 0 || height === 0) return 0;

    let maxPetals = Math.round((width * height) / 90000);
    if (isMobile) {
      maxPetals = Math.min(12, Math.max(6, maxPetals));
    } else {
      maxPetals = Math.min(24, Math.max(12, maxPetals));
    }
    return maxPetals;
  }, [dimensions, isMobile]);

  // Handle petal click
  const handlePetalClick = useCallback(
    (petal: Petal, event: MouseEvent) => {
      if (petal.collected) return;

      // Check if click is within petal bounds (16-24px hitbox)
      const hitRadius = 12;
      const dx = event.clientX - (containerRef.current?.getBoundingClientRect().left || 0) - petal.x;
      const dy = event.clientY - (containerRef.current?.getBoundingClientRect().top || 0) - petal.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= hitRadius) {
        petal.collected = true;
        petal.life = 0.8; // Start fade out

        // Collect petal
        const petalId = parseInt(petal.id.split('-')[0]) || Date.now();
        collectPetal(petalId, 1, petal.x, petal.y);

        // Show counter on first collection
        if (!showCounter && !hasCollectedAny) {
          setShowCounter(true);
        }

        // Show tooltip on first collection (once per user)
        if (!hasSeenTooltip && !showTooltip) {
          setShowTooltip(true);
          setHasSeenTooltip(true);
          localStorage.setItem('otm-petal-tooltip-seen', 'true');
        }
      }
    },
    [collectPetal, showCounter, hasCollectedAny, hasSeenTooltip, showTooltip],
  );

  // Main animation loop
  useEffect(() => {
    if (!canvasRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    let lastTime = performance.now();
    let running = true;

    const animate = (currentTime: number) => {
      if (!running) return;

      const dt = Math.min((currentTime - lastTime) / 16.67, 2); // Cap at 2x for lag
      lastTime = currentTime;

      const maxPetals = getMaxPetals();

      // Spawn new petals - less frequently for subtle effect
      if (
        petalsRef.current.length < maxPetals &&
        currentTime - lastSpawnTimeRef.current > 4000 // Spawn every 4 seconds
      ) {
        petalsRef.current.push(spawnPetal());
        lastSpawnTimeRef.current = currentTime;
      }

      // Update petals
      petalsRef.current = petalsRef.current
        .map((petal) => {
          if (petal.collected) {
            petal.life -= dt * 0.002; // Faster fade when collected
            if (petal.life <= 0) return null;
          } else {
            // Update position - more natural physics
            const wind = Math.sin(petal.y / 100 + currentTime / 2000) * 0.1; // Slower, subtler sway
            petal.x += (petal.vx + wind) * dt * 0.6; // Reduced horizontal movement
            petal.y += petal.vy * dt; // Natural gravity-based fall
            petal.rotation += petal.rotationSpeed * dt * 0.5; // Slower rotation

            // Update life (fade out in final 20%)
            const lifetime = LIFETIME_MIN + Math.random() * (LIFETIME_MAX - LIFETIME_MIN);
            const age = (currentTime - parseInt(petal.id.split('-')[0])) / lifetime;
            if (age > FADE_OUT_START) {
              petal.life = 1 - (age - FADE_OUT_START) / (1 - FADE_OUT_START);
            }

            // Remove if off screen or expired
            if (petal.y > dimensions.height + 50 || age > 1) {
              return null;
            }
          }

          return petal;
        })
        .filter((p): p is Petal => p !== null);

      // Maintain target count - spawn less frequently
      while (petalsRef.current.length < maxPetals && currentTime - lastSpawnTimeRef.current > 3000) {
        petalsRef.current.push(spawnPetal());
        lastSpawnTimeRef.current = currentTime;
      }

      // Clear and draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      petalsRef.current.forEach((petal) => {
        if (petal.life <= 0) return;

        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        ctx.globalAlpha = petal.opacity * petal.life;

        // Draw petal shape (simple ellipse for now)
        ctx.fillStyle = petal.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Handle clicks
    const handleClick = (event: MouseEvent) => {
      petalsRef.current.forEach((petal) => {
        handlePetalClick(petal, event);
      });
    };

    canvas.addEventListener('click', handleClick);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      running = false;
      canvas.removeEventListener('click', handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions, spawnPetal, getMaxPetals, handlePetalClick]);

  // Check for reduced motion
  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || dimensions.width === 0) {
    return null;
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`absolute inset-0 pointer-events-auto left-0 top-0 ${
          isMobile ? 'w-full h-1/2' : 'w-[45%] h-full'
        }`}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-auto cursor-pointer"
        />
      </div>

      {/* Tooltip - shows once on first collection */}
      {showTooltip && (
        <div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[1000] bg-[var(--om-bg-surface)] border border-[var(--om-border-strong)] rounded-lg p-4 max-w-sm shadow-lg"
        >
          <p className="text-[var(--om-text-ivory)] text-sm mb-2">
            Click falling petals to collect them! They're currency you can use in the shop.
          </p>
          <button
            onClick={() => {
              setShowTooltip(false);
              dismissAchievement();
            }}
            className="text-[var(--om-accent-pink)] text-xs hover:underline"
          >
            Got it
          </button>
        </div>
      )}
    </>
  );
}

