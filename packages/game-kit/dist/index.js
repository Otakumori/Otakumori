/**
 * @om/game-kit - Game development framework
 *
 * Provides input, physics, animation, and utilities for building games.
 */
export { DEFAULT_INPUT_MAP, createActionState } from './input/actions';
export {
  createInputSystem,
  pollInput,
  justPressed,
  justReleased,
  remapAction,
  setInputEnabled,
} from './input/system';
export {
  createTransform,
  createVelocity,
  createCharacterController,
  Vec3Math,
  RigidBodyType,
} from './physics/components';
export {
  createRapierWorld,
  stepPhysics,
  createDynamicBody,
  createFixedBody,
  createKinematicBody,
  createBoxCollider,
  createSphereCollider,
  createCapsuleCollider,
  getBodyPosition,
  setBodyPosition,
  getBodyVelocity,
  setBodyVelocity,
  applyImpulse,
  checkGrounded,
} from './physics/rapier';
export {
  updateCharacter,
  checkGroundContact,
  applyVelocity,
  resolveSlopeCollision,
  handleStepOffset,
  getHorizontalSpeed,
  getMovementDirection,
} from './physics/character';
// Animation
export { AnimState, ANIM_THRESHOLDS, DEFAULT_CLIPS } from './animation/states';
export {
  createHFSM,
  updateHFSM,
  transitionTo,
  getCurrentClip,
  getBlendWeight,
  DEFAULT_TRANSITIONS,
} from './animation/hfsm';
export {
  crossFade,
  blendAnimations,
  easeInOutCubic,
  easeOutQuad,
  easeInQuad,
  lerp,
  smoothStep,
} from './animation/blending';
export {
  createSide2DAdapter,
  createOrthoCamera,
  constrainMovement,
  constrainPosition,
  followTarget,
  worldToScreen,
  screenToWorld,
  getCameraBounds,
  isVisible,
} from './adapters/side2d';
// Prefabs
export {
  TransformComponent,
  VelocityComponent,
  CharacterComponent,
  AnimationComponent,
  AvatarDataComponent,
  PlayerComponent,
  spawnPlayer,
  spawnPlatform,
} from './prefabs/player';
export {
  loadRegistry,
  getAsset,
  listAssetsBySlot,
  getFallback,
  getSafeAlternative,
  validateRegistry,
} from './assets/registry';
