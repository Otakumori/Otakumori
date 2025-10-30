import * as _om_ecs from '@om/ecs';
import { EntityId, World } from '@om/ecs';

/**
 * Game input actions and default mappings
 */
declare enum GameAction {
  MoveX = 'MoveX',
  MoveY = 'MoveY',
  Jump = 'Jump',
  Attack = 'Attack',
  Dash = 'Dash',
  Pause = 'Pause',
}
interface KeyboardMapping {
  [GameAction.MoveX]: string[];
  [GameAction.MoveY]: string[];
  [GameAction.Jump]: string[];
  [GameAction.Attack]: string[];
  [GameAction.Dash]: string[];
  [GameAction.Pause]: string[];
}
interface GamepadAxisMapping {
  axis: number;
  deadzone: number;
  invert?: boolean;
}
interface GamepadButtonMapping {
  button: number;
}
interface GamepadMapping {
  [GameAction.MoveX]: GamepadAxisMapping;
  [GameAction.MoveY]: GamepadAxisMapping;
  [GameAction.Jump]: GamepadButtonMapping;
  [GameAction.Attack]: GamepadButtonMapping;
  [GameAction.Dash]: GamepadButtonMapping;
  [GameAction.Pause]: GamepadButtonMapping;
}
interface TouchControl {
  type: 'button' | 'joystick';
  position: 'left' | 'right' | 'center';
  size: number;
}
interface TouchMapping {
  [GameAction.MoveX]: TouchControl;
  [GameAction.MoveY]: TouchControl;
  [GameAction.Jump]: TouchControl;
  [GameAction.Attack]: TouchControl;
  [GameAction.Dash]: TouchControl;
  [GameAction.Pause]: TouchControl;
}
interface InputMapping {
  keyboard: KeyboardMapping;
  gamepad: GamepadMapping;
  touch: TouchMapping;
}
/**
 * Default input mapping
 */
declare const DEFAULT_INPUT_MAP: InputMapping;
/**
 * Action state for a single frame
 */
interface ActionState {
  [GameAction.MoveX]: number;
  [GameAction.MoveY]: number;
  [GameAction.Jump]: boolean;
  [GameAction.Attack]: boolean;
  [GameAction.Dash]: boolean;
  [GameAction.Pause]: boolean;
}
/**
 * Create empty action state
 */
declare function createActionState(): ActionState;

/**
 * Input polling system for keyboard, gamepad, and touch
 */

interface InputSystem {
  mapping: InputMapping;
  keyPressed: Set<string>;
  prevKeyPressed: Set<string>;
  gamepadIndex: number | null;
  touchActive: boolean;
  touchState: Map<
    string,
    {
      x: number;
      y: number;
    }
  >;
  enabled: boolean;
}
/**
 * Create an input system
 */
declare function createInputSystem(mapping?: InputMapping): InputSystem;
/**
 * Poll input and return current action state
 */
declare function pollInput(system: InputSystem): ActionState;
/**
 * Check if an action was just pressed this frame
 */
declare function justPressed(system: InputSystem, action: GameAction): boolean;
/**
 * Check if an action was just released this frame
 */
declare function justReleased(system: InputSystem, action: GameAction): boolean;
/**
 * Remap an action
 */
declare function remapAction(system: InputSystem, action: GameAction, keys: string[]): void;
/**
 * Enable/disable input system
 */
declare function setInputEnabled(system: InputSystem, enabled: boolean): void;

/**
 * Physics-related ECS components
 */
interface Vec3 {
  x: number;
  y: number;
  z: number;
}
interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}
/**
 * Transform component
 */
interface Transform {
  position: Vec3;
  rotation: Quaternion;
  scale: Vec3;
}
/**
 * Create a default transform
 */
declare function createTransform(
  position?: [number, number, number],
  rotation?: [number, number, number, number],
  scale?: [number, number, number],
): Transform;
/**
 * Velocity component
 */
interface Velocity {
  linear: Vec3;
  angular: Vec3;
}
/**
 * Create a default velocity
 */
declare function createVelocity(): Velocity;
/**
 * Rigid body types
 */
declare enum RigidBodyType {
  Dynamic = 'dynamic',
  Fixed = 'fixed',
  Kinematic = 'kinematic',
}
/**
 * Rigid body component (stores Rapier handle)
 */
interface RigidBody {
  handle: number;
  type: RigidBodyType;
  mass: number;
  friction: number;
  restitution: number;
}
/**
 * Collider component (stores Rapier handle)
 */
interface Collider {
  handle: number;
  sensor: boolean;
}
/**
 * Character controller state
 */
interface CharacterController {
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
declare function createCharacterController(
  options?: Partial<CharacterController>,
): CharacterController;
/**
 * Helper: Vec3 operations
 */
declare const Vec3Math: {
  add(a: Vec3, b: Vec3): Vec3;
  sub(a: Vec3, b: Vec3): Vec3;
  scale(v: Vec3, s: number): Vec3;
  length(v: Vec3): number;
  normalize(v: Vec3): Vec3;
  zero(): Vec3;
};

/**
 * Rapier physics integration
 * Lazy-loads Rapier WASM on first use
 */

type RapierWorld = any;
/**
 * Physics world wrapper
 */
interface PhysicsWorld {
  rapierWorld: RapierWorld;
  rapier: any;
  gravity: Vec3;
}
/**
 * Create a Rapier physics world
 */
declare function createRapierWorld(gravity?: [number, number, number]): Promise<PhysicsWorld>;
/**
 * Step the physics simulation
 */
declare function stepPhysics(world: PhysicsWorld, _dt: number): void;
/**
 * Create a dynamic rigid body
 */
declare function createDynamicBody(world: PhysicsWorld, position: Vec3): number;
/**
 * Create a fixed (static) rigid body
 */
declare function createFixedBody(world: PhysicsWorld, position: Vec3): number;
/**
 * Create a kinematic rigid body
 */
declare function createKinematicBody(world: PhysicsWorld, position: Vec3): number;
/**
 * Create a box collider
 */
declare function createBoxCollider(
  world: PhysicsWorld,
  bodyHandle: number,
  halfExtents: Vec3,
): number;
/**
 * Create a sphere collider
 */
declare function createSphereCollider(
  world: PhysicsWorld,
  bodyHandle: number,
  radius: number,
): number;
/**
 * Create a capsule collider
 */
declare function createCapsuleCollider(
  world: PhysicsWorld,
  bodyHandle: number,
  halfHeight: number,
  radius: number,
): number;
/**
 * Get rigid body position
 */
declare function getBodyPosition(world: PhysicsWorld, handle: number): Vec3;
/**
 * Set rigid body position
 */
declare function setBodyPosition(world: PhysicsWorld, handle: number, position: Vec3): void;
/**
 * Get rigid body velocity
 */
declare function getBodyVelocity(world: PhysicsWorld, handle: number): Vec3;
/**
 * Set rigid body velocity
 */
declare function setBodyVelocity(world: PhysicsWorld, handle: number, velocity: Vec3): void;
/**
 * Apply impulse to rigid body
 */
declare function applyImpulse(world: PhysicsWorld, handle: number, impulse: Vec3): void;
/**
 * Check if body is grounded (raycast down)
 */
declare function checkGrounded(world: PhysicsWorld, position: Vec3, distance?: number): boolean;

/**
 * Character controller for kinematic movement
 */

/**
 * Update character controller based on input
 */
declare function updateCharacter(
  controller: CharacterController,
  input: ActionState,
  dt: number,
  gravity?: Vec3,
): void;
/**
 * Check if character should be grounded
 */
declare function checkGroundContact(position: Vec3, velocity: Vec3, _rayDistance?: number): boolean;
/**
 * Apply character velocity to position
 */
declare function applyVelocity(position: Vec3, velocity: Vec3, dt: number): Vec3;
/**
 * Resolve character collision with slopes
 */
declare function resolveSlopeCollision(controller: CharacterController, slopeAngle: number): void;
/**
 * Handle step offset (stairs)
 */
declare function handleStepOffset(
  position: Vec3,
  controller: CharacterController,
  obstacleHeight: number,
): Vec3;
/**
 * Get horizontal speed
 */
declare function getHorizontalSpeed(velocity: Vec3): number;
/**
 * Get movement direction (normalized)
 */
declare function getMovementDirection(velocity: Vec3): Vec3;

/**
 * Animation state definitions
 */
declare enum AnimState {
  Idle = 'Idle',
  Walk = 'Walk',
  Run = 'Run',
  Jump = 'Jump',
  Fall = 'Fall',
  Land = 'Land',
  Attack = 'Attack',
}
/**
 * Animation clip data
 */
interface AnimationClip {
  name: string;
  duration: number;
  loop: boolean;
}
/**
 * Default animation clips
 */
declare const DEFAULT_CLIPS: Record<AnimState, AnimationClip>;
/**
 * State transition thresholds
 */
declare const ANIM_THRESHOLDS: {
  IDLE_SPEED: number;
  WALK_SPEED: number;
  FALL_VELOCITY: number;
  JUMP_VELOCITY: number;
};

/**
 * Hierarchical Finite State Machine for animations
 */

interface HFSM {
  current: AnimState;
  previous: AnimState;
  transitionProgress: number;
  transitionDuration: number;
  blendWeights: Map<AnimState, number>;
  stateTime: number;
}
interface Transition {
  from: AnimState;
  to: AnimState;
  condition: (data: TransitionData) => boolean;
  duration: number;
}
interface TransitionData {
  horizontalSpeed: number;
  verticalVelocity: number;
  isGrounded: boolean;
  coyoteTimeRemaining: number;
  attackRequested: boolean;
}
/**
 * Create a new HFSM
 */
declare function createHFSM(initialState?: AnimState): HFSM;
/**
 * Default transitions
 */
declare const DEFAULT_TRANSITIONS: Transition[];
/**
 * Update HFSM
 */
declare function updateHFSM(
  hfsm: HFSM,
  data: TransitionData,
  dt: number,
  transitions?: Transition[],
): void;
/**
 * Transition to a new state
 */
declare function transitionTo(hfsm: HFSM, newState: AnimState, duration?: number): void;
/**
 * Get current animation clip name
 */
declare function getCurrentClip(hfsm: HFSM): string;
/**
 * Get blend weight for a state
 */
declare function getBlendWeight(hfsm: HFSM, state: AnimState): number;

/**
 * Animation blending utilities
 */

/**
 * Blend tree node
 */
interface BlendNode {
  state: AnimState;
  weight: number;
  time: number;
}
/**
 * Cross-fade between two animations
 */
declare function crossFade(from: BlendNode, to: BlendNode, progress: number): BlendNode[];
/**
 * Blend multiple animations with weights
 */
declare function blendAnimations(nodes: BlendNode[]): BlendNode[];
/**
 * Easing functions for smooth transitions
 */
declare function easeInOutCubic(t: number): number;
declare function easeOutQuad(t: number): number;
declare function easeInQuad(t: number): number;
/**
 * Linear interpolation
 */
declare function lerp(a: number, b: number, t: number): number;
/**
 * Smooth step interpolation
 */
declare function smoothStep(t: number): number;

/**
 * Side-scroller adapter for 2.5D games
 * Constrains movement to X/Y plane (Z=0) with orthographic camera
 */

interface Side2DAdapter {
  clampZ: boolean;
  orthoSize: number;
  followTarget: EntityId | null;
  followDamping: number;
  cameraPosition: Vec3;
  cameraOffset: Vec3;
}
interface OrthoCameraRig {
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
declare function createSide2DAdapter(orthoSize?: number, followDamping?: number): Side2DAdapter;
/**
 * Create an orthographic camera rig
 */
declare function createOrthoCamera(
  size: number,
  aspect: number,
  near?: number,
  far?: number,
): OrthoCameraRig;
/**
 * Constrain movement to 2D plane (clamp Z to 0)
 */
declare function constrainMovement(velocity: Vec3): Vec3;
/**
 * Constrain position to 2D plane
 */
declare function constrainPosition(position: Vec3): Vec3;
/**
 * Update camera to follow target with damping
 */
declare function followTarget(
  camera: OrthoCameraRig,
  targetPos: Vec3,
  offset: Vec3,
  damping: number,
  dt: number,
): void;
/**
 * Convert world position to screen coordinates
 */
declare function worldToScreen(
  pos: Vec3,
  camera: OrthoCameraRig,
  screenWidth: number,
  screenHeight: number,
): [number, number];
/**
 * Convert screen coordinates to world position
 */
declare function screenToWorld(
  x: number,
  y: number,
  camera: OrthoCameraRig,
  screenWidth: number,
  screenHeight: number,
): Vec3;
/**
 * Get camera bounds in world space
 */
declare function getCameraBounds(camera: OrthoCameraRig): {
  left: number;
  right: number;
  top: number;
  bottom: number;
};
/**
 * Check if a position is visible in camera
 */
declare function isVisible(pos: Vec3, camera: OrthoCameraRig): boolean;

declare const TransformComponent: _om_ecs.ComponentType<Transform>;
declare const VelocityComponent: _om_ecs.ComponentType<Velocity>;
declare const CharacterComponent: _om_ecs.ComponentType<CharacterController>;
declare const AnimationComponent: _om_ecs.ComponentType<HFSM>;
declare const AvatarDataComponent: _om_ecs.ComponentType<any>;
declare const PlayerComponent: _om_ecs.ComponentType<{
  id: string;
}>;
interface SpawnPlayerOptions {
  position?: [number, number, number];
  avatarConfig?: any;
  speed?: number;
  jumpForce?: number;
}
/**
 * Spawn a player entity with all necessary components
 */
declare function spawnPlayer(world: World, options?: SpawnPlayerOptions): EntityId;
/**
 * Spawn a simple platform entity
 */
declare function spawnPlatform(
  world: World,
  position: [number, number, number],
  size: [number, number, number],
): EntityId;

/**
 * Asset registry types and runtime loader
 */
type AssetSlot = 'Head' | 'Torso' | 'Legs' | 'Accessory';
type AssetHost = 'local' | 'cdn';
type AssetCoverage = 'standard' | 'minimal' | 'full';
interface AssetMeta {
  id: string;
  slot: AssetSlot;
  nsfw: boolean;
  url: string;
  host: AssetHost;
  hash: string;
  coverage: AssetCoverage;
}
interface AssetRegistry {
  version: number;
  assets: Record<string, AssetMeta>;
  fallbacks: Record<AssetSlot, string>;
}
/**
 * Load asset registry from JSON
 */
declare function loadRegistry(): Promise<AssetRegistry>;
/**
 * Get asset by ID
 */
declare function getAsset(registry: AssetRegistry, id: string): AssetMeta | undefined;
/**
 * List assets by slot
 */
declare function listAssetsBySlot(
  registry: AssetRegistry,
  slot: AssetSlot,
  options?: {
    nsfw?: boolean;
  },
): AssetMeta[];
/**
 * Get fallback asset for a slot
 */
declare function getFallback(registry: AssetRegistry, slot: AssetSlot): AssetMeta | undefined;
/**
 * Get safe alternative for an asset
 */
declare function getSafeAlternative(
  registry: AssetRegistry,
  assetId: string,
): AssetMeta | undefined;
/**
 * Validate registry
 */
declare function validateRegistry(registry: AssetRegistry): {
  valid: boolean;
  errors: string[];
};

export {
  ANIM_THRESHOLDS,
  type ActionState,
  AnimState,
  type AnimationClip,
  AnimationComponent,
  type AssetCoverage,
  type AssetHost,
  type AssetMeta,
  type AssetRegistry,
  type AssetSlot,
  AvatarDataComponent,
  type BlendNode,
  CharacterComponent,
  type CharacterController,
  type Collider,
  DEFAULT_CLIPS,
  DEFAULT_INPUT_MAP,
  DEFAULT_TRANSITIONS,
  GameAction,
  type GamepadMapping,
  type HFSM,
  type InputMapping,
  type InputSystem,
  type KeyboardMapping,
  type OrthoCameraRig,
  type PhysicsWorld,
  PlayerComponent,
  type Quaternion,
  type RigidBody,
  RigidBodyType,
  type Side2DAdapter,
  type SpawnPlayerOptions,
  type TouchMapping,
  type Transform,
  TransformComponent,
  type Transition,
  type TransitionData,
  type Vec3,
  Vec3Math,
  type Velocity,
  VelocityComponent,
  applyImpulse,
  applyVelocity,
  blendAnimations,
  checkGroundContact,
  checkGrounded,
  constrainMovement,
  constrainPosition,
  createActionState,
  createBoxCollider,
  createCapsuleCollider,
  createCharacterController,
  createDynamicBody,
  createFixedBody,
  createHFSM,
  createInputSystem,
  createKinematicBody,
  createOrthoCamera,
  createRapierWorld,
  createSide2DAdapter,
  createSphereCollider,
  createTransform,
  createVelocity,
  crossFade,
  easeInOutCubic,
  easeInQuad,
  easeOutQuad,
  followTarget,
  getAsset,
  getBlendWeight,
  getBodyPosition,
  getBodyVelocity,
  getCameraBounds,
  getCurrentClip,
  getFallback,
  getHorizontalSpeed,
  getMovementDirection,
  getSafeAlternative,
  handleStepOffset,
  isVisible,
  justPressed,
  justReleased,
  lerp,
  listAssetsBySlot,
  loadRegistry,
  pollInput,
  remapAction,
  resolveSlopeCollision,
  screenToWorld,
  setBodyPosition,
  setBodyVelocity,
  setInputEnabled,
  smoothStep,
  spawnPlatform,
  spawnPlayer,
  stepPhysics,
  transitionTo,
  updateCharacter,
  updateHFSM,
  validateRegistry,
  worldToScreen,
};
