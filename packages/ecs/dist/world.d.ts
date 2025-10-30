/**
 * ECS World - Bevy-inspired Entity Component System
 * Stores entities and components with efficient querying
 */
export type EntityId = string;
export interface ComponentType<_T> {
  readonly __brand: symbol;
  readonly name: string;
}
export interface World {
  nextEntityId: string | number;
  components: Map<ComponentType<any>, Map<EntityId, any>>;
  entities: Set<EntityId>;
}
/**
 * Create a component type identifier
 */
export declare function defineComponent<T>(name: string): ComponentType<T>;
/**
 * Create a new world
 */
export declare function createWorld(): World;
/**
 * Spawn a new entity
 */
export declare function spawn(world: World): EntityId;
/**
 * Despawn an entity and remove all its components
 */
export declare function despawn(world: World, entity: EntityId): void;
/**
 * Add a component to an entity
 */
export declare function add<T>(
  world: World,
  component: ComponentType<T>,
  entity: EntityId,
  data: T,
): void;
/**
 * Get a component from an entity
 */
export declare function get<T>(
  world: World,
  component: ComponentType<T>,
  entity: EntityId,
): T | undefined;
/**
 * Check if an entity has a component
 */
export declare function has(world: World, component: ComponentType<any>, entity: EntityId): boolean;
/**
 * Remove a component from an entity
 */
export declare function remove(world: World, component: ComponentType<any>, entity: EntityId): void;
/**
 * Query entities with specific components (1 component)
 */
export declare function query<T1>(world: World, c1: ComponentType<T1>): Iterable<[EntityId, T1]>;
/**
 * Query entities with specific components (2 components)
 */
export declare function query2<T1, T2>(
  world: World,
  c1: ComponentType<T1>,
  c2: ComponentType<T2>,
): Iterable<[EntityId, T1, T2]>;
/**
 * Query entities with specific components (3 components)
 */
export declare function query3<T1, T2, T3>(
  world: World,
  c1: ComponentType<T1>,
  c2: ComponentType<T2>,
  c3: ComponentType<T3>,
): Iterable<[EntityId, T1, T2, T3]>;
/**
 * Query entities with specific components (4 components)
 */
export declare function query4<T1, T2, T3, T4>(
  world: World,
  c1: ComponentType<T1>,
  c2: ComponentType<T2>,
  c3: ComponentType<T3>,
  c4: ComponentType<T4>,
): Iterable<[EntityId, T1, T2, T3, T4]>;
/**
 * Count entities in the world
 */
export declare function entityCount(world: World): number;
/**
 * Clear all entities and components
 */
export declare function clear(world: World): void;
/**
 * Create an entity ID from a string or number
 */
export declare function createEntityId(id: string | number): EntityId;
//# sourceMappingURL=world.d.ts.map
