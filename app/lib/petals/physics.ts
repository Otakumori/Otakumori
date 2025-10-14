/**
 * Petal Physics Calculations
 * Helper functions for particle movement and animations
 */

import { PHYSICS } from './constants';

export interface Petal {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  opacity: number;
  color: string;
  isRare: boolean;
  value: number;
  seed: number; // For deterministic wind patterns
  isCollecting?: boolean;
  collectionProgress?: number;
}

export interface Position {
  x: number;
  y: number;
}

/**
 * Creates a new petal with randomized physics properties
 */
export function createPetal(
  id: number,
  color: string,
  isRare: boolean,
  value: number,
): Petal {
  return {
    id,
    x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
    y: -50,
    vx: (Math.random() - 0.5) * 0.5,
    vy: Math.random() * 0.5 + 0.5,
    rotation: Math.random() * 360,
    rotationSpeed:
      PHYSICS.ROTATION_SPEED_MIN +
      Math.random() * (PHYSICS.ROTATION_SPEED_MAX - PHYSICS.ROTATION_SPEED_MIN),
    scale: 1,
    opacity: 0,
    color,
    isRare,
    value,
    seed: Math.random() * 1000,
  };
}

/**
 * Updates petal physics for one frame
 */
export function updatePetalPhysics(petal: Petal, time: number, deltaTime: number): Petal {
  // Apply gravity
  const newVy = petal.vy + PHYSICS.GRAVITY * deltaTime;

  // Apply wind (sine wave for natural sway)
  const windEffect = Math.sin((time * 0.001 + petal.seed) * 2) * PHYSICS.WIND_STRENGTH;
  const newVx = petal.vx * PHYSICS.AIR_RESISTANCE + windEffect * deltaTime;

  // Update position
  const newX = petal.x + newVx;
  const newY = petal.y + newVy;

  // Update rotation
  const newRotation = petal.rotation + petal.rotationSpeed;

  // Fade in at top, fade out at bottom
  let newOpacity = petal.opacity;
  if (petal.y < 50) {
    newOpacity = Math.min(1, petal.opacity + 0.02);
  } else if (
    typeof window !== 'undefined' &&
    petal.y > window.innerHeight - 100
  ) {
    newOpacity = Math.max(0, petal.opacity - 0.02);
  } else {
    newOpacity = Math.min(1, petal.opacity + 0.02);
  }

  return {
    ...petal,
    vx: newVx,
    vy: newVy,
    x: newX,
    y: newY,
    rotation: newRotation,
    opacity: newOpacity,
  };
}

/**
 * Checks if petal should be removed (off screen)
 */
export function shouldRemovePetal(petal: Petal): boolean {
  if (typeof window === 'undefined') return false;

  return (
    petal.y > window.innerHeight + 100 ||
    petal.x < -100 ||
    petal.x > window.innerWidth + 100
  );
}

/**
 * Linear interpolation
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Easing function for bounce effect
 */
export function easeOutBounce(t: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (t < 1 / d1) {
    return n1 * t * t;
  } else if (t < 2 / d1) {
    return n1 * (t -= 1.5 / d1) * t + 0.75;
  } else if (t < 2.5 / d1) {
    return n1 * (t -= 2.25 / d1) * t + 0.9375;
  } else {
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  }
}

/**
 * Easing function for smooth in-out
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Checks if point is within petal hitbox
 */
export function isPointInPetal(
  point: Position,
  petal: Petal,
  hitboxRadius = 30,
): boolean {
  const dx = point.x - petal.x;
  const dy = point.y - petal.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < hitboxRadius * petal.scale;
}

/**
 * Calculates collection animation state
 */
export function calculateCollectionAnimation(
  petal: Petal,
  progress: number,
  targetPosition: Position,
): Partial<Petal> {
  // Progress: 0 to 1 over entire animation

  // Phase 1: Bounce (0 - 0.33)
  if (progress < 0.33) {
    const bounceProgress = progress / 0.33;
    const scale = 1 + easeOutBounce(bounceProgress) * 0.3;
    return { scale };
  }

  // Phase 2: Move and spin (0.33 - 0.83)
  if (progress < 0.83) {
    const moveProgress = (progress - 0.33) / 0.5;
    const easedProgress = easeInOutCubic(moveProgress);

    const x = lerp(petal.x, targetPosition.x, easedProgress);
    const y = lerp(petal.y, targetPosition.y, easedProgress);
    const rotation = petal.rotation + 360 * easedProgress;
    const scale = 1.3 - 0.3 * easedProgress;

    return { x, y, rotation, scale };
  }

  // Phase 3: Fade out (0.83 - 1.0)
  const fadeProgress = (progress - 0.83) / 0.17;
  const opacity = 1 - fadeProgress;

  return { opacity };
}

/**
 * Generates sparkle positions around a point
 */
export function generateSparkles(center: Position, count: number): Position[] {
  const sparkles: Position[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const distance = 20 + Math.random() * 20;

    sparkles.push({
      x: center.x + Math.cos(angle) * distance,
      y: center.y + Math.sin(angle) * distance,
    });
  }

  return sparkles;
}

