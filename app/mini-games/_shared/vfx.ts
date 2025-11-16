/**
 * Shared VFX Utilities for Mini-Games
 * 
 * Provides reusable visual effects:
 * - Screen shake
 * - Petal burst particles
 * - Easing functions
 * - Trail renderer for slash VFX
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Easing Functions
 * Standard easing curves for smooth animations
 */
export const easingFunctions = {
  /**
   * Linear interpolation (no easing)
   */
  linear: (t: number): number => t,

  /**
   * Ease in-out cubic
   */
  easeInOutCubic: (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  },

  /**
   * Ease out cubic
   */
  easeOutCubic: (t: number): number => {
    return 1 - Math.pow(1 - t, 3);
  },

  /**
   * Ease in-out quad
   */
  easeInOutQuad: (t: number): number => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  },

  /**
   * Ease out quad
   */
  easeOutQuad: (t: number): number => {
    return 1 - (1 - t) * (1 - t);
  },

  /**
   * Ease in-out back (with slight overshoot)
   */
  easeInOutBack: (t: number): number => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;

    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
};

/**
 * Screen Shake Hook
 * Provides camera shake effect for impact feedback
 */
export function useScreenShake() {
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const shake = useCallback(
    (intensity: number = 0.3, duration: number = 200) => {
      // Cancel existing shake
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      startTimeRef.current = Date.now();
      const maxOffset = intensity * 10; // Max pixels

      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
          // Decay shake intensity over time
          const decay = 1 - progress;
          const offsetX = (Math.random() - 0.5) * maxOffset * decay;
          const offsetY = (Math.random() - 0.5) * maxOffset * decay;

          setShakeOffset({ x: offsetX, y: offsetY });
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Reset to center
          setShakeOffset({ x: 0, y: 0 });
          animationRef.current = null;
        }
      };

      animate();
    },
    [],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    shake,
    shakeOffset,
    style: {
      transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
    },
  };
}

/**
 * Petal Particle Interface
 */
export interface PetalParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  spriteIndex: number; // Index in sprite sheet (0-11 for 4x3 grid)
}

/**
 * Create Petal Burst Effect
 * Generates petal particles for slice/burst effects
 */
export function createPetalBurst(
  x: number,
  y: number,
  count: number = 8,
  options?: {
    speed?: number;
    spread?: number; // Angle spread in radians
    spriteSheetUrl?: string;
  },
): PetalParticle[] {
  const speed = options?.speed ?? 2;
  const spread = options?.spread ?? Math.PI * 2; // Full circle by default

  const particles: PetalParticle[] = [];
  const angleStep = spread / count;

  for (let i = 0; i < count; i++) {
    const angle = angleStep * i + (Math.random() - 0.5) * 0.2; // Add slight randomness
    const particleSpeed = speed * (0.7 + Math.random() * 0.3); // Vary speed

    particles.push({
      id: `petal-${Date.now()}-${i}`,
      x,
      y,
      vx: Math.cos(angle) * particleSpeed,
      vy: Math.sin(angle) * particleSpeed,
      rotation: angle + Math.PI / 2, // Rotate petal to face direction
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      scale: 0.8 + Math.random() * 0.4,
      alpha: 1,
      lifetime: 0,
      maxLifetime: 800 + Math.random() * 400, // 800-1200ms
      spriteIndex: Math.floor(Math.random() * 12), // Random sprite from 4x3 grid
    });
  }

  return particles;
}

/**
 * Update Petal Particles
 * Advances particle physics and removes expired particles
 */
export function updatePetalParticles(
  particles: PetalParticle[],
  deltaTime: number,
  gravity: number = 0.1,
): PetalParticle[] {
  return particles
    .map((particle) => {
      // Update position
      const newX = particle.x + particle.vx * deltaTime;
      const newY = particle.y + particle.vy * deltaTime;

      // Apply gravity
      const newVy = particle.vy + gravity * deltaTime;

      // Update rotation
      const newRotation = particle.rotation + particle.rotationSpeed * deltaTime;

      // Update lifetime
      const newLifetime = particle.lifetime + deltaTime;
      const progress = newLifetime / particle.maxLifetime;

      // Fade out over time
      const newAlpha = Math.max(0, 1 - progress);

      // Scale down slightly over time
      const newScale = particle.scale * (1 - progress * 0.3);

      return {
        ...particle,
        x: newX,
        y: newY,
        vy: newVy,
        rotation: newRotation,
        lifetime: newLifetime,
        alpha: newAlpha,
        scale: newScale,
      };
    })
    .filter((particle) => particle.lifetime < particle.maxLifetime && particle.alpha > 0);
}

/**
 * Trail Point Interface
 */
export interface TrailPoint {
  x: number;
  y: number;
  time: number;
  width: number;
}

/**
 * Trail Renderer
 * Lightweight trail system for slash VFX (150-250ms lifetime)
 */
export class TrailRenderer {
  private trails: TrailPoint[] = [];
  private maxTrailLength: number = 10;
  private lifetime: number = 200; // ms

  /**
   * Add a point to the trail
   */
  addPoint(x: number, y: number, width: number = 3): void {
    this.trails.push({
      x,
      y,
      time: Date.now(),
      width,
    });

    // Limit trail length
    if (this.trails.length > this.maxTrailLength) {
      this.trails.shift();
    }
  }

  /**
   * Update trail (remove expired points)
   */
  update(): void {
    const now = Date.now();
    this.trails = this.trails.filter((point) => now - point.time < this.lifetime);
  }

  /**
   * Clear all trails
   */
  clear(): void {
    this.trails = [];
  }

  /**
   * Get current trail points
   */
  getTrails(): TrailPoint[] {
    return this.trails;
  }

  /**
   * Render trail to canvas context
   */
  render(
    ctx: CanvasRenderingContext2D,
    options?: {
      color?: string;
      additiveBlending?: boolean;
    },
  ): void {
    if (this.trails.length < 2) return;

    const color = options?.color ?? 'rgba(236, 72, 153, 0.8)'; // Pink with alpha
    const now = Date.now();

    ctx.save();

    if (options?.additiveBlending) {
      // Use composite operation for additive blending effect
      ctx.globalCompositeOperation = 'lighter';
    }

    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw trail segments
    for (let i = 1; i < this.trails.length; i++) {
      const prev = this.trails[i - 1];
      const curr = this.trails[i];

      const age = now - curr.time;
      const progress = age / this.lifetime;
      const alpha = 1 - progress;

      ctx.globalAlpha = alpha;
      ctx.lineWidth = curr.width * (1 - progress * 0.5); // Fade width too

      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Set trail lifetime
   */
  setLifetime(ms: number): void {
    this.lifetime = Math.max(150, Math.min(250, ms)); // Clamp to 150-250ms
  }
}

/**
 * Create a new trail renderer instance
 */
export function createTrailRenderer(lifetime: number = 200): TrailRenderer {
  const renderer = new TrailRenderer();
  renderer.setLifetime(lifetime);
  return renderer;
}

