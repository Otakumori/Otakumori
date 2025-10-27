/**
 * Character controller for kinematic movement
 */

import type { CharacterController, Vec3 } from './components';
import { Vec3Math } from './components';
import type { ActionState } from '../input/actions';
import { GameAction } from '../input/actions';

/**
 * Coyote time configuration (frames)
 */
const COYOTE_TIME_FRAMES = 6; // ~100ms at 60Hz

/**
 * Jump buffer configuration (frames)
 */
const JUMP_BUFFER_FRAMES = 6; // ~100ms at 60Hz

/**
 * Update character controller based on input
 */
export function updateCharacter(
  controller: CharacterController,
  input: ActionState,
  dt: number,
  gravity: Vec3 = { x: 0, y: -9.81, z: 0 },
): void {
  // Update grounded state
  if (controller.onGround) {
    controller.groundedFrames++;
    controller.coyoteTime = COYOTE_TIME_FRAMES;
  } else {
    controller.groundedFrames = 0;
    if (controller.coyoteTime > 0) {
      controller.coyoteTime--;
    }
  }

  // Handle jump input
  if (input[GameAction.Jump]) {
    controller.jumpBuffer = JUMP_BUFFER_FRAMES;
  } else if (controller.jumpBuffer > 0) {
    controller.jumpBuffer--;
  }

  // Execute jump if buffered and coyote time allows
  if (controller.jumpBuffer > 0 && controller.coyoteTime > 0) {
    controller.velocity.y = controller.jumpForce;
    controller.jumpBuffer = 0;
    controller.coyoteTime = 0;
    controller.onGround = false;
  }

  // Horizontal movement
  const moveX = input[GameAction.MoveX];
  controller.velocity.x = moveX * controller.speed;

  // Apply gravity
  if (!controller.onGround) {
    controller.velocity.y += gravity.y * dt;
  } else {
    // Snap to ground
    if (controller.velocity.y < 0) {
      controller.velocity.y = 0;
    }
  }
}

/**
 * Check if character should be grounded
 */
export function checkGroundContact(
  position: Vec3,
  velocity: Vec3,
  _rayDistance: number = 0.15,
): boolean {
  // Simplified ground check - in real implementation, use Rapier raycast
  return position.y <= 0 && velocity.y <= 0;
}

/**
 * Apply character velocity to position
 */
export function applyVelocity(position: Vec3, velocity: Vec3, dt: number): Vec3 {
  return Vec3Math.add(position, Vec3Math.scale(velocity, dt));
}

/**
 * Resolve character collision with slopes
 */
export function resolveSlopeCollision(controller: CharacterController, slopeAngle: number): void {
  // If slope is too steep, slide down
  if (slopeAngle > controller.slopeLimit) {
    controller.onGround = false;
  }
}

/**
 * Handle step offset (stairs)
 */
export function handleStepOffset(
  position: Vec3,
  controller: CharacterController,
  obstacleHeight: number,
): Vec3 {
  // If obstacle is within step offset, move up
  if (obstacleHeight <= controller.stepOffset) {
    return { ...position, y: position.y + obstacleHeight };
  }
  return position;
}

/**
 * Get horizontal speed
 */
export function getHorizontalSpeed(velocity: Vec3): number {
  return Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
}

/**
 * Get movement direction (normalized)
 */
export function getMovementDirection(velocity: Vec3): Vec3 {
  const horizontal = { x: velocity.x, y: 0, z: velocity.z };
  return Vec3Math.normalize(horizontal);
}
