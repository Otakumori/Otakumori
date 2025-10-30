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
export declare function crossFade(from: BlendNode, to: BlendNode, progress: number): BlendNode[];
/**
 * Blend multiple animations with weights
 */
export declare function blendAnimations(nodes: BlendNode[]): BlendNode[];
/**
 * Easing functions for smooth transitions
 */
export declare function easeInOutCubic(t: number): number;
export declare function easeOutQuad(t: number): number;
export declare function easeInQuad(t: number): number;
/**
 * Linear interpolation
 */
export declare function lerp(a: number, b: number, t: number): number;
/**
 * Smooth step interpolation
 */
export declare function smoothStep(t: number): number;
//# sourceMappingURL=blending.d.ts.map
