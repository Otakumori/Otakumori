/**
 * Physics-related ECS components
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

/**
 * Transform component
 */
export interface Transform {
  position: Vec3;
  rotation: Quaternion;
  scale: Vec3;
}

/**
 * Create a default transform
 */
export function createTransform(
  position: [number, number, number] = [0, 0, 0],
  rotation: [number, number, number, number] = [0, 0, 0, 1],
  scale: [number, number, number] = [1, 1, 1],
): Transform {
  return {
    position: { x: position[0], y: position[1], z: position[2] },
    rotation: { x: rotation[0], y: rotation[1], z: rotation[2], w: rotation[3] },
    scale: { x: scale[0], y: scale[1], z: scale[2] },
  };
}

/**
 * Velocity component
 */
export interface Velocity {
  linear: Vec3;
  angular: Vec3;
}

/**
 * Create a default velocity
 */
export function createVelocity(): Velocity {
  return {
    linear: { x: 0, y: 0, z: 0 },
    angular: { x: 0, y: 0, z: 0 },
  };
}

/**
 * Rigid body types
 */
export enum RigidBodyType {
  Dynamic = 'dynamic',
  Fixed = 'fixed',
  Kinematic = 'kinematic',
}

/**
 * Rigid body component (stores Rapier handle)
 */
export interface RigidBody {
  handle: number;
  type: RigidBodyType;
  mass: number;
  friction: number;
  restitution: number;
}

/**
 * Collider component (stores Rapier handle)
 */
export interface Collider {
  handle: number;
  sensor: boolean;
}

/**
 * Character controller state
 */
export interface CharacterController {
  velocity: Vec3;
  onGround: boolean;
  coyoteTime: number; // Frames remaining
  jumpBuffer: number; // Frames remaining
  slopeLimit: number; // Max slope angle in radians
  stepOffset: number; // Max step height
  speed: number;
  jumpForce: number;
  grounded: boolean;
  groundedFrames: number;
}

/**
 * Create a default character controller
 */
export function createCharacterController(
  options: Partial<CharacterController> = {},
): CharacterController {
  return {
    velocity: options.velocity || { x: 0, y: 0, z: 0 },
    onGround: options.onGround ?? false,
    coyoteTime: options.coyoteTime ?? 0,
    jumpBuffer: options.jumpBuffer ?? 0,
    slopeLimit: options.slopeLimit ?? Math.PI / 4, // 45 degrees
    stepOffset: options.stepOffset ?? 0.3,
    speed: options.speed ?? 5.0,
    jumpForce: options.jumpForce ?? 10.0,
    grounded: options.grounded ?? false,
    groundedFrames: options.groundedFrames ?? 0,
  };
}

/**
 * Helper: Vec3 operations
 */
export const Vec3Math = {
  add(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
  },

  sub(a: Vec3, b: Vec3): Vec3 {
    return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  },

  scale(v: Vec3, s: number): Vec3 {
    return { x: v.x * s, y: v.y * s, z: v.z * s };
  },

  length(v: Vec3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
  },

  normalize(v: Vec3): Vec3 {
    const len = Vec3Math.length(v);
    if (len === 0) return { x: 0, y: 0, z: 0 };
    return Vec3Math.scale(v, 1 / len);
  },

  zero(): Vec3 {
    return { x: 0, y: 0, z: 0 };
  },
};
