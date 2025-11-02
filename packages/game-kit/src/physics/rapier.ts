/**
 * Rapier physics integration
 * Lazy-loads Rapier WASM on first use
 */

import type { Vec3 } from './components';

// Rapier types (will be loaded dynamically)
type RapierWorld = any;

let rapierModule: any = null;
let rapierLoading: Promise<any> | null = null;

/**
 * Lazy-load Rapier module
 */
async function loadRapier(): Promise<any> {
  if (rapierModule) {
    return rapierModule;
  }

  if (rapierLoading) {
    return rapierLoading;
  }

  rapierLoading = import('@dimforge/rapier3d-compat').then((module) => {
    rapierModule = module;
    return module;
  });

  return rapierLoading;
}

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
export async function createRapierWorld(
  gravity: [number, number, number] = [0, -9.81, 0],
): Promise<PhysicsWorld> {
  const rapier = await loadRapier();
  const rapierWorld = new rapier.World({ x: gravity[0], y: gravity[1], z: gravity[2] });

  return {
    rapierWorld,
    rapier,
    gravity: { x: gravity[0], y: gravity[1], z: gravity[2] },
  };
}

/**
 * Step the physics simulation
 */
export function stepPhysics(world: PhysicsWorld, dt: number): void {
  if (dt > 0) {
    world.rapierWorld.timestep = dt;
  }
  world.rapierWorld.step();
}

/**
 * Create a dynamic rigid body
 */
export function createDynamicBody(world: PhysicsWorld, position: Vec3): number {
  const { rapier, rapierWorld } = world;
  const bodyDesc = rapier.RigidBodyDesc.dynamic().setTranslation(
    position.x,
    position.y,
    position.z,
  );
  const body = rapierWorld.createRigidBody(bodyDesc);
  return body.handle;
}

/**
 * Create a fixed (static) rigid body
 */
export function createFixedBody(world: PhysicsWorld, position: Vec3): number {
  const { rapier, rapierWorld } = world;
  const bodyDesc = rapier.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z);
  const body = rapierWorld.createRigidBody(bodyDesc);
  return body.handle;
}

/**
 * Create a kinematic rigid body
 */
export function createKinematicBody(world: PhysicsWorld, position: Vec3): number {
  const { rapier, rapierWorld } = world;
  const bodyDesc = rapier.RigidBodyDesc.kinematicPositionBased().setTranslation(
    position.x,
    position.y,
    position.z,
  );
  const body = rapierWorld.createRigidBody(bodyDesc);
  return body.handle;
}

/**
 * Create a box collider
 */
export function createBoxCollider(
  world: PhysicsWorld,
  bodyHandle: number,
  halfExtents: Vec3,
): number {
  const { rapier, rapierWorld } = world;
  const colliderDesc = rapier.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z);
  const body = rapierWorld.getRigidBody(bodyHandle);
  const collider = rapierWorld.createCollider(colliderDesc, body);
  return collider.handle;
}

/**
 * Create a sphere collider
 */
export function createSphereCollider(
  world: PhysicsWorld,
  bodyHandle: number,
  radius: number,
): number {
  const { rapier, rapierWorld } = world;
  const colliderDesc = rapier.ColliderDesc.ball(radius);
  const body = rapierWorld.getRigidBody(bodyHandle);
  const collider = rapierWorld.createCollider(colliderDesc, body);
  return collider.handle;
}

/**
 * Create a capsule collider
 */
export function createCapsuleCollider(
  world: PhysicsWorld,
  bodyHandle: number,
  halfHeight: number,
  radius: number,
): number {
  const { rapier, rapierWorld } = world;
  const colliderDesc = rapier.ColliderDesc.capsule(halfHeight, radius);
  const body = rapierWorld.getRigidBody(bodyHandle);
  const collider = rapierWorld.createCollider(colliderDesc, body);
  return collider.handle;
}

/**
 * Get rigid body position
 */
export function getBodyPosition(world: PhysicsWorld, handle: number): Vec3 {
  const body = world.rapierWorld.getRigidBody(handle);
  if (!body) {
    return { x: 0, y: 0, z: 0 };
  }
  const translation = body.translation();
  return { x: translation.x, y: translation.y, z: translation.z };
}

/**
 * Set rigid body position
 */
export function setBodyPosition(world: PhysicsWorld, handle: number, position: Vec3): void {
  const body = world.rapierWorld.getRigidBody(handle);
  if (body) {
    body.setTranslation({ x: position.x, y: position.y, z: position.z }, true);
  }
}

/**
 * Get rigid body velocity
 */
export function getBodyVelocity(world: PhysicsWorld, handle: number): Vec3 {
  const body = world.rapierWorld.getRigidBody(handle);
  if (!body) {
    return { x: 0, y: 0, z: 0 };
  }
  const velocity = body.linvel();
  return { x: velocity.x, y: velocity.y, z: velocity.z };
}

/**
 * Set rigid body velocity
 */
export function setBodyVelocity(world: PhysicsWorld, handle: number, velocity: Vec3): void {
  const body = world.rapierWorld.getRigidBody(handle);
  if (body) {
    body.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
  }
}

/**
 * Apply impulse to rigid body
 */
export function applyImpulse(world: PhysicsWorld, handle: number, impulse: Vec3): void {
  const body = world.rapierWorld.getRigidBody(handle);
  if (body) {
    body.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
  }
}

/**
 * Check if body is grounded (raycast down)
 */
export function checkGrounded(
  world: PhysicsWorld,
  position: Vec3,
  distance: number = 0.1,
): boolean {
  const { rapierWorld, rapier } = world;
  const ray = new rapier.Ray(
    { x: position.x, y: position.y, z: position.z },
    { x: 0, y: -1, z: 0 },
  );
  const hit = rapierWorld.castRay(ray, distance, true);
  return hit !== null;
}
