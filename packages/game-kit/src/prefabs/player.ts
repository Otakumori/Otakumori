/**
 * Player prefab - Connects avatar, controller, and HFSM
 */

import type { World, EntityId } from '@om/ecs';
import { spawn, add, defineComponent } from '@om/ecs';
import {
  createTransform,
  createVelocity,
  createCharacterController,
  type Transform,
  type Velocity,
  type CharacterController,
} from '../physics/components';
import { createHFSM, type HFSM } from '../animation/hfsm';

// Define player-specific components
export const TransformComponent = defineComponent<Transform>('Transform');
export const VelocityComponent = defineComponent<Velocity>('Velocity');
export const CharacterComponent = defineComponent<CharacterController>('Character');
export const AnimationComponent = defineComponent<HFSM>('Animation');
export const AvatarDataComponent = defineComponent<any>('AvatarData');
export const PlayerComponent = defineComponent<{ id: string }>('Player');

export interface SpawnPlayerOptions {
  position?: [number, number, number];
  avatarConfig?: any;
  speed?: number;
  jumpForce?: number;
}

/**
 * Spawn a player entity with all necessary components
 */
export function spawnPlayer(world: World, options: SpawnPlayerOptions = {}): EntityId {
  const { position = [0, 2, 0], avatarConfig = null, speed = 5.0, jumpForce = 10.0 } = options;

  const entity = spawn(world);

  // Add transform
  add(world, TransformComponent, entity, createTransform(position));

  // Add velocity
  add(world, VelocityComponent, entity, createVelocity());

  // Add character controller
  const controller = createCharacterController({ speed, jumpForce });
  add(world, CharacterComponent, entity, controller);

  // Add animation state machine
  add(world, AnimationComponent, entity, createHFSM());

  // Add avatar data
  if (avatarConfig) {
    add(world, AvatarDataComponent, entity, avatarConfig);
  }

  // Mark as player
  add(world, PlayerComponent, entity, { id: 'player' });

  return entity;
}

/**
 * Spawn a simple platform entity
 */
export function spawnPlatform(
  world: World,
  position: [number, number, number],
  size: [number, number, number],
): EntityId {
  const entity = spawn(world);

  add(world, TransformComponent, entity, createTransform(position));

  // Add platform-specific data
  const PlatformComponent = defineComponent<{ size: [number, number, number] }>('Platform');
  add(world, PlatformComponent, entity, { size });

  return entity;
}
