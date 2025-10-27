/**
 * ECS Systems - Functions that operate on world state
 */

import type { World } from './world';

/**
 * System function signature
 * @param world - The ECS world
 * @param dt - Delta time in seconds (fixed at 1/60)
 */
export type System = (world: World, dt: number) => void;

/**
 * System scheduler for organizing system execution
 */
export interface SystemScheduler {
  systems: System[];
  enabled: boolean;
}

/**
 * Create a system scheduler
 */
export function createScheduler(): SystemScheduler {
  return {
    systems: [],
    enabled: true,
  };
}

/**
 * Add a system to the scheduler
 */
export function addSystem(scheduler: SystemScheduler, system: System): void {
  scheduler.systems.push(system);
}

/**
 * Remove a system from the scheduler
 */
export function removeSystem(scheduler: SystemScheduler, system: System): void {
  const index = scheduler.systems.indexOf(system);
  if (index !== -1) {
    scheduler.systems.splice(index, 1);
  }
}

/**
 * Run all systems in the scheduler
 */
export function runSystems(scheduler: SystemScheduler, world: World, dt: number): void {
  if (!scheduler.enabled) {
    return;
  }

  for (const system of scheduler.systems) {
    system(world, dt);
  }
}

/**
 * Clear all systems from the scheduler
 */
export function clearSystems(scheduler: SystemScheduler): void {
  scheduler.systems = [];
}
