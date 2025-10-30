/**
 * Character controller for kinematic movement
 */
import type { CharacterController, Vec3 } from './components';
import type { ActionState } from '../input/actions';
/**
 * Update character controller based on input
 */
export declare function updateCharacter(
  controller: CharacterController,
  input: ActionState,
  dt: number,
  gravity?: Vec3,
): void;
/**
 * Check if character should be grounded
 */
export declare function checkGroundContact(
  position: Vec3,
  velocity: Vec3,
  _rayDistance?: number,
): boolean;
/**
 * Apply character velocity to position
 */
export declare function applyVelocity(position: Vec3, velocity: Vec3, dt: number): Vec3;
/**
 * Resolve character collision with slopes
 */
export declare function resolveSlopeCollision(
  controller: CharacterController,
  slopeAngle: number,
): void;
/**
 * Handle step offset (stairs)
 */
export declare function handleStepOffset(
  position: Vec3,
  controller: CharacterController,
  obstacleHeight: number,
): Vec3;
/**
 * Get horizontal speed
 */
export declare function getHorizontalSpeed(velocity: Vec3): number;
/**
 * Get movement direction (normalized)
 */
export declare function getMovementDirection(velocity: Vec3): Vec3;
//# sourceMappingURL=character.d.ts.map
