/**
 * @om/ecs - Bevy-inspired Entity Component System
 *
 * Provides efficient entity-component storage and fixed timestep game loop.
 */

// World
export type { World, EntityId, ComponentType } from './world';
export {
  createWorld,
  defineComponent,
  spawn,
  despawn,
  add,
  get,
  has,
  remove,
  query,
  query2,
  query3,
  query4,
  entityCount,
  clear,
  createEntityId,
} from './world';

// Systems
export type { System, SystemScheduler } from './system';
export { createScheduler, addSystem, removeSystem, runSystems, clearSystems } from './system';

// Game Loop
export type { GameLoop, GameLoopOptions } from './loop';
export { createGameLoop } from './loop';

// React integration is exported separately
// import { useGameLoop } from '@om/ecs/react';
