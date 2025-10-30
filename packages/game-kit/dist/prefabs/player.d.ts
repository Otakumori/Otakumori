/**
 * Player prefab - Connects avatar, controller, and HFSM
 */
import type { World, EntityId } from '@om/ecs';
import { type Transform, type Velocity, type CharacterController } from '../physics/components';
import { type HFSM } from '../animation/hfsm';
export declare const TransformComponent: import('@om/ecs').ComponentType<Transform>;
export declare const VelocityComponent: import('@om/ecs').ComponentType<Velocity>;
export declare const CharacterComponent: import('@om/ecs').ComponentType<CharacterController>;
export declare const AnimationComponent: import('@om/ecs').ComponentType<HFSM>;
export declare const AvatarDataComponent: import('@om/ecs').ComponentType<any>;
export declare const PlayerComponent: import('@om/ecs').ComponentType<{
  id: string;
}>;
export interface SpawnPlayerOptions {
  position?: [number, number, number];
  avatarConfig?: any;
  speed?: number;
  jumpForce?: number;
}
/**
 * Spawn a player entity with all necessary components
 */
export declare function spawnPlayer(world: World, options?: SpawnPlayerOptions): EntityId;
/**
 * Spawn a simple platform entity
 */
export declare function spawnPlatform(
  world: World,
  position: [number, number, number],
  size: [number, number, number],
): EntityId;
//# sourceMappingURL=player.d.ts.map
