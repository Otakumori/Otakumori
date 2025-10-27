/**
 * ECS Systems - Functions that operate on world state
 */
/**
 * Create a system scheduler
 */
export function createScheduler() {
    return {
        systems: [],
        enabled: true,
    };
}
/**
 * Add a system to the scheduler
 */
export function addSystem(scheduler, system) {
    scheduler.systems.push(system);
}
/**
 * Remove a system from the scheduler
 */
export function removeSystem(scheduler, system) {
    const index = scheduler.systems.indexOf(system);
    if (index !== -1) {
        scheduler.systems.splice(index, 1);
    }
}
/**
 * Run all systems in the scheduler
 */
export function runSystems(scheduler, world, dt) {
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
export function clearSystems(scheduler) {
    scheduler.systems = [];
}
