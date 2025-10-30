/**
 * Rapier physics integration
 * Lazy-loads Rapier WASM on first use
 */
import type { Vec3 } from './components';
type RapierWorld = any;
/**
 * Physics world wrapper
 */
export interface PhysicsWorld {
  rapierWorld: RapierWorld;
  rapier: any;
  gravity: Vec3;
}
/**
 * Create a Rapier physics world
 */
export declare function createRapierWorld(
  gravity?: [number, number, number],
): Promise<PhysicsWorld>;
/**
 * Step the physics simulation
 */
export declare function stepPhysics(world: PhysicsWorld, _dt: number): void;
/**
 * Create a dynamic rigid body
 */
export declare function createDynamicBody(world: PhysicsWorld, position: Vec3): number;
/**
 * Create a fixed (static) rigid body
 */
export declare function createFixedBody(world: PhysicsWorld, position: Vec3): number;
/**
 * Create a kinematic rigid body
 */
export declare function createKinematicBody(world: PhysicsWorld, position: Vec3): number;
/**
 * Create a box collider
 */
export declare function createBoxCollider(
  world: PhysicsWorld,
  bodyHandle: number,
  halfExtents: Vec3,
): number;
/**
 * Create a sphere collider
 */
export declare function createSphereCollider(
  world: PhysicsWorld,
  bodyHandle: number,
  radius: number,
): number;
/**
 * Create a capsule collider
 */
export declare function createCapsuleCollider(
  world: PhysicsWorld,
  bodyHandle: number,
  halfHeight: number,
  radius: number,
): number;
/**
 * Get rigid body position
 */
export declare function getBodyPosition(world: PhysicsWorld, handle: number): Vec3;
/**
 * Set rigid body position
 */
export declare function setBodyPosition(world: PhysicsWorld, handle: number, position: Vec3): void;
/**
 * Get rigid body velocity
 */
export declare function getBodyVelocity(world: PhysicsWorld, handle: number): Vec3;
/**
 * Set rigid body velocity
 */
export declare function setBodyVelocity(world: PhysicsWorld, handle: number, velocity: Vec3): void;
/**
 * Apply impulse to rigid body
 */
export declare function applyImpulse(world: PhysicsWorld, handle: number, impulse: Vec3): void;
/**
 * Check if body is grounded (raycast down)
 */
export declare function checkGrounded(
  world: PhysicsWorld,
  position: Vec3,
  distance?: number,
): boolean;
export {};
//# sourceMappingURL=rapier.d.ts.map
