/**
 * Animation blending utilities
 */

import type { AnimState } from './states';

/**
 * Blend tree node
 */
export interface BlendNode {
  state: AnimState;
  weight: number;
  time: number;
}

/**
 * Cross-fade between two animations
 */
export function crossFade(
  from: BlendNode,
  to: BlendNode,
  progress: number, // 0-1
): BlendNode[] {
  const t = easeInOutCubic(progress);
  return [
    { ...from, weight: 1 - t },
    { ...to, weight: t },
  ];
}

/**
 * Blend multiple animations with weights
 */
export function blendAnimations(nodes: BlendNode[]): BlendNode[] {
  // Normalize weights
  const totalWeight = nodes.reduce((sum, node) => sum + node.weight, 0);
  if (totalWeight === 0) {
    return nodes;
  }

  return nodes.map((node) => ({
    ...node,
    weight: node.weight / totalWeight,
  }));
}

/**
 * Easing functions for smooth transitions
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

export function easeInQuad(t: number): number {
  return t * t;
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Smooth step interpolation
 */
export function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}
