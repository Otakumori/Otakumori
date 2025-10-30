/**
 * @om/game-kit - Game development framework
 *
 * Provides input, physics, animation, and utilities for building games.
 */
export type { GameAction, InputMapping, KeyboardMapping, GamepadMapping, TouchMapping, ActionState, } from './input/actions';
export { DEFAULT_INPUT_MAP, createActionState } from './input/actions';
export type { InputSystem } from './input/system';
export { createInputSystem, pollInput, justPressed, justReleased, remapAction, setInputEnabled, } from './input/system';
export type { Vec3, Quaternion, Transform, Velocity, RigidBody, Collider, CharacterController, } from './physics/components';
export { createTransform, createVelocity, createCharacterController, Vec3Math, RigidBodyType, } from './physics/components';
export type { PhysicsWorld } from './physics/rapier';
export { createRapierWorld, stepPhysics, createDynamicBody, createFixedBody, createKinematicBody, createBoxCollider, createSphereCollider, createCapsuleCollider, getBodyPosition, setBodyPosition, getBodyVelocity, setBodyVelocity, applyImpulse, checkGrounded, } from './physics/rapier';
export { updateCharacter, checkGroundContact, applyVelocity, resolveSlopeCollision, handleStepOffset, getHorizontalSpeed, getMovementDirection, } from './physics/character';
export { AnimState, ANIM_THRESHOLDS, DEFAULT_CLIPS } from './animation/states';
export type { AnimationClip } from './animation/states';
export type { HFSM, Transition, TransitionData } from './animation/hfsm';
export { createHFSM, updateHFSM, transitionTo, getCurrentClip, getBlendWeight, DEFAULT_TRANSITIONS, } from './animation/hfsm';
export type { BlendNode } from './animation/blending';
export { crossFade, blendAnimations, easeInOutCubic, easeOutQuad, easeInQuad, lerp, smoothStep, } from './animation/blending';
export type { Side2DAdapter, OrthoCameraRig } from './adapters/side2d';
export { createSide2DAdapter, createOrthoCamera, constrainMovement, constrainPosition, followTarget, worldToScreen, screenToWorld, getCameraBounds, isVisible, } from './adapters/side2d';
export { TransformComponent, VelocityComponent, CharacterComponent, AnimationComponent, AvatarDataComponent, PlayerComponent, spawnPlayer, spawnPlatform, } from './prefabs/player';
export type { SpawnPlayerOptions } from './prefabs/player';
export type { AssetMeta, AssetRegistry, AssetSlot, AssetHost, AssetCoverage, } from './assets/registry';
export { loadRegistry, getAsset, listAssetsBySlot, getFallback, getSafeAlternative, validateRegistry, } from './assets/registry';
//# sourceMappingURL=index.d.ts.map