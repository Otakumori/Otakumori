/**
 * Rapier physics integration
 * Lazy-loads Rapier WASM on first use
 */
let rapierModule = null;
let rapierLoading = null;
/**
 * Lazy-load Rapier module
 */
async function loadRapier() {
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
 * Create a Rapier physics world
 */
export async function createRapierWorld(gravity = [0, -9.81, 0]) {
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
export function stepPhysics(world, _dt) {
  world.rapierWorld.step();
}
/**
 * Create a dynamic rigid body
 */
export function createDynamicBody(world, position) {
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
export function createFixedBody(world, position) {
  const { rapier, rapierWorld } = world;
  const bodyDesc = rapier.RigidBodyDesc.fixed().setTranslation(position.x, position.y, position.z);
  const body = rapierWorld.createRigidBody(bodyDesc);
  return body.handle;
}
/**
 * Create a kinematic rigid body
 */
export function createKinematicBody(world, position) {
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
export function createBoxCollider(world, bodyHandle, halfExtents) {
  const { rapier, rapierWorld } = world;
  const colliderDesc = rapier.ColliderDesc.cuboid(halfExtents.x, halfExtents.y, halfExtents.z);
  const body = rapierWorld.getRigidBody(bodyHandle);
  const collider = rapierWorld.createCollider(colliderDesc, body);
  return collider.handle;
}
/**
 * Create a sphere collider
 */
export function createSphereCollider(world, bodyHandle, radius) {
  const { rapier, rapierWorld } = world;
  const colliderDesc = rapier.ColliderDesc.ball(radius);
  const body = rapierWorld.getRigidBody(bodyHandle);
  const collider = rapierWorld.createCollider(colliderDesc, body);
  return collider.handle;
}
/**
 * Create a capsule collider
 */
export function createCapsuleCollider(world, bodyHandle, halfHeight, radius) {
  const { rapier, rapierWorld } = world;
  const colliderDesc = rapier.ColliderDesc.capsule(halfHeight, radius);
  const body = rapierWorld.getRigidBody(bodyHandle);
  const collider = rapierWorld.createCollider(colliderDesc, body);
  return collider.handle;
}
/**
 * Get rigid body position
 */
export function getBodyPosition(world, handle) {
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
export function setBodyPosition(world, handle, position) {
  const body = world.rapierWorld.getRigidBody(handle);
  if (body) {
    body.setTranslation({ x: position.x, y: position.y, z: position.z }, true);
  }
}
/**
 * Get rigid body velocity
 */
export function getBodyVelocity(world, handle) {
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
export function setBodyVelocity(world, handle, velocity) {
  const body = world.rapierWorld.getRigidBody(handle);
  if (body) {
    body.setLinvel({ x: velocity.x, y: velocity.y, z: velocity.z }, true);
  }
}
/**
 * Apply impulse to rigid body
 */
export function applyImpulse(world, handle, impulse) {
  const body = world.rapierWorld.getRigidBody(handle);
  if (body) {
    body.applyImpulse({ x: impulse.x, y: impulse.y, z: impulse.z }, true);
  }
}
/**
 * Check if body is grounded (raycast down)
 */
export function checkGrounded(world, position, distance = 0.1) {
  const { rapierWorld, rapier } = world;
  const ray = new rapier.Ray(
    { x: position.x, y: position.y, z: position.z },
    { x: 0, y: -1, z: 0 },
  );
  const hit = rapierWorld.castRay(ray, distance, true);
  return hit !== null;
}
