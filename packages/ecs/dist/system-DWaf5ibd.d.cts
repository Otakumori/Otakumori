/**
 * ECS World - Bevy-inspired Entity Component System
 * Stores entities and components with efficient querying
 */
type EntityId = number;
interface ComponentType<_T> {
    readonly __brand: symbol;
    readonly name: string;
}
interface World {
    nextEntityId: number;
    components: Map<ComponentType<any>, Map<EntityId, any>>;
    entities: Set<EntityId>;
}
/**
 * Create a component type identifier
 */
declare function defineComponent<T>(name: string): ComponentType<T>;
/**
 * Create a new world
 */
declare function createWorld(): World;
/**
 * Spawn a new entity
 */
declare function spawn(world: World): EntityId;
/**
 * Despawn an entity and remove all its components
 */
declare function despawn(world: World, entity: EntityId): void;
/**
 * Add a component to an entity
 */
declare function add<T>(world: World, component: ComponentType<T>, entity: EntityId, data: T): void;
/**
 * Get a component from an entity
 */
declare function get<T>(world: World, component: ComponentType<T>, entity: EntityId): T | undefined;
/**
 * Check if an entity has a component
 */
declare function has(world: World, component: ComponentType<any>, entity: EntityId): boolean;
/**
 * Remove a component from an entity
 */
declare function remove(world: World, component: ComponentType<any>, entity: EntityId): void;
/**
 * Query entities with specific components (1 component)
 */
declare function query<T1>(world: World, c1: ComponentType<T1>): Iterable<[EntityId, T1]>;
/**
 * Query entities with specific components (2 components)
 */
declare function query2<T1, T2>(world: World, c1: ComponentType<T1>, c2: ComponentType<T2>): Iterable<[EntityId, T1, T2]>;
/**
 * Query entities with specific components (3 components)
 */
declare function query3<T1, T2, T3>(world: World, c1: ComponentType<T1>, c2: ComponentType<T2>, c3: ComponentType<T3>): Iterable<[EntityId, T1, T2, T3]>;
/**
 * Query entities with specific components (4 components)
 */
declare function query4<T1, T2, T3, T4>(world: World, c1: ComponentType<T1>, c2: ComponentType<T2>, c3: ComponentType<T3>, c4: ComponentType<T4>): Iterable<[EntityId, T1, T2, T3, T4]>;
/**
 * Count entities in the world
 */
declare function entityCount(world: World): number;
/**
 * Clear all entities and components
 */
declare function clear(world: World): void;

/**
 * ECS Systems - Functions that operate on world state
 */

/**
 * System function signature
 * @param world - The ECS world
 * @param dt - Delta time in seconds (fixed at 1/60)
 */
type System = (world: World, dt: number) => void;
/**
 * System scheduler for organizing system execution
 */
interface SystemScheduler {
    systems: System[];
    enabled: boolean;
}
/**
 * Create a system scheduler
 */
declare function createScheduler(): SystemScheduler;
/**
 * Add a system to the scheduler
 */
declare function addSystem(scheduler: SystemScheduler, system: System): void;
/**
 * Remove a system from the scheduler
 */
declare function removeSystem(scheduler: SystemScheduler, system: System): void;
/**
 * Run all systems in the scheduler
 */
declare function runSystems(scheduler: SystemScheduler, world: World, dt: number): void;
/**
 * Clear all systems from the scheduler
 */
declare function clearSystems(scheduler: SystemScheduler): void;

export { type ComponentType as C, type EntityId as E, type System as S, type World as W, despawn as a, add as b, createWorld as c, defineComponent as d, query2 as e, query3 as f, get as g, has as h, query4 as i, entityCount as j, clear as k, type SystemScheduler as l, createScheduler as m, addSystem as n, removeSystem as o, runSystems as p, query as q, remove as r, spawn as s, clearSystems as t };
