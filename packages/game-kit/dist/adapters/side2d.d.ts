/**
 * Side-scroller adapter for 2.5D games
 * Constrains movement to X/Y plane (Z=0) with orthographic camera
 */
import type { Vec3 } from '../physics/components';
import type { EntityId } from '@om/ecs';
export interface Side2DAdapter {
  clampZ: boolean;
  orthoSize: number;
  followTarget: EntityId | null;
  followDamping: number;
  cameraPosition: Vec3;
  cameraOffset: Vec3;
}
export interface OrthoCameraRig {
  position: Vec3;
  target: Vec3;
  size: number;
  aspect: number;
  near: number;
  far: number;
}
/**
 * Create a side-scroller adapter
 */
export declare function createSide2DAdapter(
  orthoSize?: number,
  followDamping?: number,
): Side2DAdapter;
/**
 * Create an orthographic camera rig
 */
export declare function createOrthoCamera(
  size: number,
  aspect: number,
  near?: number,
  far?: number,
): OrthoCameraRig;
/**
 * Constrain movement to 2D plane (clamp Z to 0)
 */
export declare function constrainMovement(velocity: Vec3): Vec3;
/**
 * Constrain position to 2D plane
 */
export declare function constrainPosition(position: Vec3): Vec3;
/**
 * Update camera to follow target with damping
 */
export declare function followTarget(
  camera: OrthoCameraRig,
  targetPos: Vec3,
  offset: Vec3,
  damping: number,
  dt: number,
): void;
/**
 * Convert world position to screen coordinates
 */
export declare function worldToScreen(
  pos: Vec3,
  camera: OrthoCameraRig,
  screenWidth: number,
  screenHeight: number,
): [number, number];
/**
 * Convert screen coordinates to world position
 */
export declare function screenToWorld(
  x: number,
  y: number,
  camera: OrthoCameraRig,
  screenWidth: number,
  screenHeight: number,
): Vec3;
/**
 * Get camera bounds in world space
 */
export declare function getCameraBounds(camera: OrthoCameraRig): {
  left: number;
  right: number;
  top: number;
  bottom: number;
};
/**
 * Check if a position is visible in camera
 */
export declare function isVisible(pos: Vec3, camera: OrthoCameraRig): boolean;
//# sourceMappingURL=side2d.d.ts.map
