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
export declare function createTransform(
  position?: [number, number, number],
  rotation?: [number, number, number, number],
  scale?: [number, number, number],
): Transform;
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
export declare function createVelocity(): Velocity;
/**
 * Rigid body types
 */
export declare enum RigidBodyType {
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
  coyoteTime: number;
  jumpBuffer: number;
  slopeLimit: number;
  stepOffset: number;
  speed: number;
  jumpForce: number;
  grounded: boolean;
  groundedFrames: number;
}
/**
 * Create a default character controller
 */
export declare function createCharacterController(
  options?: Partial<CharacterController>,
): CharacterController;
/**
 * Helper: Vec3 operations
 */
export declare const Vec3Math: {
  add(a: Vec3, b: Vec3): Vec3;
  sub(a: Vec3, b: Vec3): Vec3;
  scale(v: Vec3, s: number): Vec3;
  length(v: Vec3): number;
  normalize(v: Vec3): Vec3;
  zero(): Vec3;
};
//# sourceMappingURL=components.d.ts.map
