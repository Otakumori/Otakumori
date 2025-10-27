/**
 * @om/ecs - Bevy-inspired Entity Component System
 *
 * Provides efficient entity-component storage and fixed timestep game loop.
 */
export { createWorld, defineComponent, spawn, despawn, add, get, has, remove, query, query2, query3, query4, entityCount, clear, createEntityId, } from './world';
export { createScheduler, addSystem, removeSystem, runSystems, clearSystems } from './system';
export { createGameLoop } from './loop';
// React integration is exported separately
// import { useGameLoop } from '@om/ecs/react';
