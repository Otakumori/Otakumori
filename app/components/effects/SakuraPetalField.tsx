'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePetalCollection } from '@/app/hooks/usePetalCollection';

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
  collected?: boolean; // Track if petal has been collected
  id?: string; // Unique ID for collection tracking
  }

interface SakuraPetalFieldProps {
  petalCount?: number;
  /**
   * Z-index for layering (default: -5)
   */
  zIndex?: number;
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
export function SakuraPetalField({ petalCount = 90, zIndex = -5 }: SakuraPetalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const { collectPetal } = usePetalCollection();

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
      // Use full page dimensions, not just viewport
      const pageWidth = window.innerWidth;
      const pageHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        window.innerHeight
      );
      // Set canvas internal dimensions
      canvas.width = pageWidth;
      canvas.height = pageHeight;
      // Set CSS dimensions to match - prevents squishing
      canvas.style.width = `${pageWidth}px`;
      canvas.style.height = `${pageHeight}px`;
    };

    resize();
    window.addEventListener('resize', resize);
    
    // Also update when document height changes (content loads, etc.)
    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    // Initialize petals with two depth layers
    const petals: Petal[] = [];
    const nearRatio = 0.45; // ~45% near, 55% far

    for (let i = 0; i < petalCount; i++) {
      const layer: PetalLayer = Math.random() < nearRatio ? 'near' : 'far';
      const petal = createPetal(canvas.width, canvas.height, layer);
      petal.id = `${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`;
      petal.collected = false;
      petals.push(petal);
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
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [petalCount]);

  // Handle click to collect petals - subtle, non-intrusive
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!canvasRef.current || !containerRef.current) return;

      const canvas = canvasRef.current;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Hit detection radius - forgiving for easy collection
      const hitRadius = 30;
      let nearestPetal: Petal | null = null;
      let nearestDistance = hitRadius;

      // Find nearest uncollected petal
      for (const petal of petalsRef.current) {
        if (petal.collected) continue;

        const dx = clickX - petal.x;
        const dy = clickY - petal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPetal = petal;
        }
      }

      // Collect petal if clicked
      if (nearestPetal) {
        nearestPetal.collected = true;
        nearestPetal.opacity = 0; // Fade out immediately

        // Normalize coordinates for collection API
        const normalizedX = clickX / rect.width;
        const normalizedY = clickY / rect.height;

        // Collect via petal economy system
        const petalId = parseInt(nearestPetal.id?.split('-')[0] || '0') || Date.now();
        collectPetal(petalId, 1, normalizedX, normalizedY);
      }
    },
    [collectPetal],
  );

  // Check for reduced motion preference for render
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed"
      style={{
        left: 0,
        top: 0,
        margin: 0,
        padding: 0,
        zIndex,
        width: '100vw',
        height: '100%',
        cursor: 'default', // Subtle - no pointer cursor to keep it mysterious
      }}
      onClick={handleClick}
      aria-label="Interactive sakura petal field - click petals to collect them"
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{ 
          left: 0,
          top: 0,
          margin: 0,
          padding: 0,
          background: 'transparent',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
}

/**
 * Create a new petal with properties based on its layer
 * Spawns from tree area (left side, top portion where blossoms are)
 */
function createPetal(width: number, height: number, layer: PetalLayer): Petal {
  const isNear = layer === 'near';

  const baseSize = isNear ? 12 : 7;
  const sizeJitter = isNear ? 6 : 4;

  // Tree area: left side, blossoms in top 40% of viewport
  const treeWidth = Math.min(420, width * 0.3); // Tree width matches ScrollableTree component
  const blossomAreaTop = height * 0.05; // Top 5% of screen
  const blossomAreaBottom = height * 0.35; // Top 35% of screen (where blossoms visually are)

  // Spawn from tree blossom area
  const spawnX = Math.random() * treeWidth * 0.8; // Within tree area, slight margin
  const spawnY = blossomAreaTop + Math.random() * (blossomAreaBottom - blossomAreaTop);

  // Gentle flow physics - drift outward from tree and fall naturally
  const baseVy = isNear ? 35 : 18; // px/s - gentle downward fall
  const vyJitter = isNear ? 20 : 12;

  // Slight drift rightward (away from tree) with gentle variation
  const baseVx = isNear ? 8 : 4; // Drift away from tree
  const vxJitter = isNear ? 10 : 6;

  return {
    x: spawnX,
    y: spawnY,
    vx: baseVx + (Math.random() - 0.3) * vxJitter, // Slight bias rightward
    vy: baseVy + Math.random() * vyJitter,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * (isNear ? 0.6 : 0.3), // Gentle rotation
    size: baseSize + Math.random() * sizeJitter,
    opacity: isNear ? 0.9 : 0.55,
    layer,
    collected: false,
  };
}

/**
 * Respawn a petal from the tree blossom area when it falls off screen
 */
function respawnPetal(petal: Petal, width: number, height: number) {
  const layer = petal.layer;
  const isNear = layer === 'near';
  const baseSize = isNear ? 12 : 7;
  const sizeJitter = isNear ? 6 : 4;
  
  // Tree area: left side, blossoms in top portion
  const treeWidth = Math.min(420, width * 0.3);
  const blossomAreaTop = height * 0.05;
  const blossomAreaBottom = height * 0.35;

  // Respawn from tree blossom area
  petal.x = Math.random() * treeWidth * 0.8;
  petal.y = blossomAreaTop + Math.random() * (blossomAreaBottom - blossomAreaTop);
  
  // Gentle flow physics - drift outward and fall
  const baseVy = isNear ? 35 : 18;
  const vyJitter = isNear ? 20 : 12;
  const baseVx = isNear ? 8 : 4;
  const vxJitter = isNear ? 10 : 6;

  petal.vx = baseVx + (Math.random() - 0.3) * vxJitter; // Slight bias rightward
  petal.vy = baseVy + Math.random() * vyJitter;
  petal.rotation = Math.random() * Math.PI * 2;
  petal.rotationSpeed = (Math.random() - 0.5) * (isNear ? 0.6 : 0.3);
  petal.size = baseSize + Math.random() * sizeJitter;
  petal.opacity = isNear ? 0.9 : 0.55;
  petal.collected = false; // Reset collected status on respawn
}

/**
 * Update petal physics with gentle flow from tree
 */
function updatePetals(
  petals: Petal[],
  width: number,
  height: number,
  dt: number,
) {
  // Gentle wind effect - subtle breeze that helps petals flow naturally
  const wind = Math.sin(performance.now() / 8000) * 2.5; // Slower, gentler wind

  for (const p of petals) {
    // Skip collected petals
    if (p.collected) continue;
    // Gentle acceleration - petals start slow near tree, drift naturally
    const distanceFromTree = p.x;
    const windMultiplier = 1 + (distanceFromTree / width) * 0.3; // Slight increase as they drift away
    
    // Update position with gentle physics
    p.x += (p.vx + wind * windMultiplier) * dt;
    p.y += p.vy * dt;
    
    // Gentle rotation with subtle variation for natural movement
    const rotationVariation = Math.sin(performance.now() / 5000 + p.x * 0.01) * 0.02;
    p.rotation += (p.rotationSpeed + rotationVariation) * dt;

    // Wrap horizontally (if petal drifts too far right, respawn from tree)
    if (p.x < -50) {
      respawnPetal(p, width, height);
    }
    if (p.x > width + 50) {
      respawnPetal(p, width, height);
    }

    // Respawn when off bottom - return to tree blossom area
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

  // Separate petals by layer, filter out collected ones
  const far = petals.filter((p) => p.layer === 'far' && !p.collected);
  const near = petals.filter((p) => p.layer === 'near' && !p.collected);

  // Draw far layer first, then near (proper depth)
  const drawSet = (set: Petal[]) => {
    for (const p of set) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // 90s anime cherry blossom style - cel-shaded with light pink base and darker shadows
      const petalSize = p.size;
      const centerX = 0;
      const centerY = 0;

      // 90s anime cherry blossom colors - matching tree's light pink with darker shadows
      // Light pink base (matching tree blossoms) - brighter for visibility
      const lightPink = `rgba(255, 192, 203, ${p.opacity})`; // #FFC0CB - matches tree
      const lightPinkAlt = `rgba(255, 182, 193, ${p.opacity * 0.98})`; // #FFB6C1 - slight variation

      // Medium pink for mid-tones - more visible
      const mediumPink = `rgba(255, 160, 180, ${p.opacity * 0.9})`; // Softer medium

      // Darker pink/magenta for shadows (90s anime style) - more contrast
      const shadowPink = `rgba(236, 72, 153, ${p.opacity * 0.75})`; // #EC4899 - darker shadow
      const deepShadow = `rgba(219, 39, 119, ${p.opacity * 0.55})`; // #DB2777 - deepest shadow

      // Cel-shaded radial gradient (90s anime style - hard color stops)
      const gradient = ctx.createRadialGradient(
        centerX - petalSize * 0.2, // Offset light source slightly up-left
        centerY - petalSize * 0.2,
        0,
        centerX,
        centerY,
        petalSize * 1.2,
      );

      // Hard color stops for cel-shaded look (90s anime aesthetic)
      gradient.addColorStop(0, lightPink); // Bright center (highlight)
      gradient.addColorStop(0.3, lightPinkAlt); // Light area
      gradient.addColorStop(0.5, mediumPink); // Mid-tone transition
      gradient.addColorStop(0.7, shadowPink); // Shadow area (harder transition)
      gradient.addColorStop(1, deepShadow); // Deep shadow edge

      // Draw individual cherry blossom petal shape (90s anime style)
      // Petal shape: oval/teardrop with notch at top - classic cherry blossom petal
      ctx.beginPath();
      
      const petalWidth = petalSize;
      const petalHeight = petalSize * 1.2; // Slightly taller than wide
      
      // Start from top center (notch point)
      ctx.moveTo(centerX, centerY - petalHeight / 2);
      
      // Left side curve (top to middle)
      ctx.quadraticCurveTo(
        centerX - petalWidth * 0.3, // Control point left
        centerY - petalHeight * 0.2,
        centerX - petalWidth * 0.4, // Left edge
        centerY + petalHeight * 0.1
      );
      
      // Bottom left curve
      ctx.quadraticCurveTo(
        centerX - petalWidth * 0.35,
        centerY + petalHeight * 0.4,
        centerX - petalWidth * 0.2, // Bottom left
        centerY + petalHeight / 2
      );
      
      // Bottom point
      ctx.quadraticCurveTo(
        centerX,
        centerY + petalHeight * 0.55,
        centerX, // Bottom center point
        centerY + petalHeight / 2
      );
      
      // Bottom right curve
      ctx.quadraticCurveTo(
        centerX,
        centerY + petalHeight * 0.55,
        centerX + petalWidth * 0.2, // Bottom right
        centerY + petalHeight / 2
      );
      
      // Right side curve (middle to top)
      ctx.quadraticCurveTo(
        centerX + petalWidth * 0.35,
        centerY + petalHeight * 0.4,
        centerX + petalWidth * 0.4, // Right edge
        centerY + petalHeight * 0.1
      );
      
      // Top right curve back to notch
      ctx.quadraticCurveTo(
        centerX + petalWidth * 0.3, // Control point right
        centerY - petalHeight * 0.2,
        centerX, // Back to top center (notch)
        centerY - petalHeight / 2
      );
      
      ctx.closePath();

      // Fill with cel-shaded gradient
      ctx.fillStyle = gradient;
      ctx.fill();

      // Subtle outline for 90s anime definition (more visible)
      ctx.strokeStyle = `rgba(219, 39, 119, ${p.opacity * 0.35})`; // Dark pink outline - more visible
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  };

  drawSet(far);
  drawSet(near);
}

