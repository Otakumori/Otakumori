/**
 * Side-scroller adapter for 2.5D games
 * Constrains movement to X/Y plane (Z=0) with orthographic camera
 */

import type { Vec3 } from '../physics/components';
import type { EntityId } from '@om/ecs';

export interface Side2DAdapter {
  clampZ: boolean; // Always true
  orthoSize: number; // Orthographic camera size
  followTarget: EntityId | null;
  followDamping: number;
  cameraPosition: Vec3;
  cameraOffset: Vec3;
}

export interface OrthoCameraRig {
  position: Vec3;
  target: Vec3;
  size: number; // Height in world units
  aspect: number; // Width / height
  near: number;
  far: number;
}

/**
 * Create a side-scroller adapter
 */
export function createSide2DAdapter(
  orthoSize: number = 10,
  followDamping: number = 0.1,
): Side2DAdapter {
  return {
    clampZ: true,
    orthoSize,
    followTarget: null,
    followDamping,
    cameraPosition: { x: 0, y: 5, z: 10 },
    cameraOffset: { x: 0, y: 2, z: 0 },
  };
}

/**
 * Create an orthographic camera rig
 */
export function createOrthoCamera(
  size: number,
  aspect: number,
  near: number = 0.1,
  far: number = 1000,
): OrthoCameraRig {
  return {
    position: { x: 0, y: 5, z: 10 },
    target: { x: 0, y: 0, z: 0 },
    size,
    aspect,
    near,
    far,
  };
}

/**
 * Constrain movement to 2D plane (clamp Z to 0)
 */
export function constrainMovement(velocity: Vec3): Vec3 {
  return {
    x: velocity.x,
    y: velocity.y,
    z: 0, // Always clamp Z
  };
}

/**
 * Constrain position to 2D plane
 */
export function constrainPosition(position: Vec3): Vec3 {
  return {
    x: position.x,
    y: position.y,
    z: 0,
  };
}

/**
 * Update camera to follow target with damping
 */
export function followTarget(
  camera: OrthoCameraRig,
  targetPos: Vec3,
  offset: Vec3,
  damping: number,
  dt: number,
): void {
  const desiredPos = {
    x: targetPos.x + offset.x,
    y: targetPos.y + offset.y,
    z: camera.position.z, // Keep Z fixed
  };

  // Smooth follow with damping
  const lerpFactor = 1 - Math.exp(-damping * dt * 60); // Frame-rate independent
  camera.position.x += (desiredPos.x - camera.position.x) * lerpFactor;
  camera.position.y += (desiredPos.y - camera.position.y) * lerpFactor;

  // Update target
  camera.target.x = camera.position.x;
  camera.target.y = camera.position.y;
  camera.target.z = 0;
}

/**
 * Convert world position to screen coordinates
 */
export function worldToScreen(
  pos: Vec3,
  camera: OrthoCameraRig,
  screenWidth: number,
  screenHeight: number,
): [number, number] {
  // Calculate visible world space
  const halfHeight = camera.size / 2;
  const halfWidth = (camera.size * camera.aspect) / 2;

  // Calculate relative position from camera
  const relX = pos.x - (camera.position.x - halfWidth);
  const relY = pos.y - (camera.position.y - halfHeight);

  // Convert to screen space
  const screenX = (relX / (halfWidth * 2)) * screenWidth;
  const screenY = screenHeight - (relY / (halfHeight * 2)) * screenHeight;

  return [screenX, screenY];
}

/**
 * Convert screen coordinates to world position
 */
export function screenToWorld(
  x: number,
  y: number,
  camera: OrthoCameraRig,
  screenWidth: number,
  screenHeight: number,
): Vec3 {
  // Calculate visible world space
  const halfHeight = camera.size / 2;
  const halfWidth = (camera.size * camera.aspect) / 2;

  // Convert screen to normalized coordinates
  const normX = x / screenWidth;
  const normY = 1 - y / screenHeight;

  // Convert to world space
  const worldX = camera.position.x - halfWidth + normX * halfWidth * 2;
  const worldY = camera.position.y - halfHeight + normY * halfHeight * 2;

  return { x: worldX, y: worldY, z: 0 };
}

/**
 * Get camera bounds in world space
 */
export function getCameraBounds(camera: OrthoCameraRig): {
  left: number;
  right: number;
  top: number;
  bottom: number;
} {
  const halfHeight = camera.size / 2;
  const halfWidth = (camera.size * camera.aspect) / 2;

  return {
    left: camera.position.x - halfWidth,
    right: camera.position.x + halfWidth,
    top: camera.position.y + halfHeight,
    bottom: camera.position.y - halfHeight,
  };
}

/**
 * Check if a position is visible in camera
 */
export function isVisible(pos: Vec3, camera: OrthoCameraRig): boolean {
  const bounds = getCameraBounds(camera);
  return (
    pos.x >= bounds.left && pos.x <= bounds.right && pos.y >= bounds.bottom && pos.y <= bounds.top
  );
}
