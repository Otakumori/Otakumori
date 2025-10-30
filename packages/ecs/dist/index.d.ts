/**
 * @om/ecs - Bevy-inspired Entity Component System
 *
 * Provides efficient entity-component storage and fixed timestep game loop.
 */
export type { World, EntityId, ComponentType } from './world';
export { createWorld, defineComponent, spawn, despawn, add, get, has, remove, query, query2, query3, query4, entityCount, clear, createEntityId, } from './world';
export type { System, SystemScheduler } from './system';
export { createScheduler, addSystem, removeSystem, runSystems, clearSystems } from './system';
export type { GameLoop, GameLoopOptions } from './loop';
export { createGameLoop } from './loop';
//# sourceMappingURL=index.d.ts.map