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
export declare function createScheduler(): SystemScheduler;
/**
 * Add a system to the scheduler
 */
export declare function addSystem(scheduler: SystemScheduler, system: System): void;
/**
 * Remove a system from the scheduler
 */
export declare function removeSystem(scheduler: SystemScheduler, system: System): void;
/**
 * Run all systems in the scheduler
 */
export declare function runSystems(scheduler: SystemScheduler, world: World, dt: number): void;
/**
 * Clear all systems from the scheduler
 */
export declare function clearSystems(scheduler: SystemScheduler): void;
//# sourceMappingURL=system.d.ts.map