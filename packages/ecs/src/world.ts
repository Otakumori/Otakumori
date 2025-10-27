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
export function defineComponent<T>(name: string): ComponentType<T> {
  return {
    __brand: Symbol(name),
    name,
  };
}

/**
 * Create a new world
 */
export function createWorld(): World {
  return {
    nextEntityId: 0,
    components: new Map(),
    entities: new Set<EntityId>(),
  };
}

/**
 * Spawn a new entity
 */
export function spawn(world: World): EntityId {
  const numericId =
    typeof world.nextEntityId === 'number'
      ? world.nextEntityId++
      : parseInt(world.nextEntityId as string, 10) || 0;
  const id = String(numericId);
  world.nextEntityId = numericId + 1;
  world.entities.add(id);
  return id;
}

/**
 * Despawn an entity and remove all its components
 */
export function despawn(world: World, entity: EntityId): void {
  if (!world.entities.has(entity)) {
    return;
  }

  world.entities.delete(entity);

  // Remove entity from all component maps
  for (const componentMap of world.components.values()) {
    componentMap.delete(entity);
  }
}

/**
 * Add a component to an entity
 */
export function add<T>(world: World, component: ComponentType<T>, entity: EntityId, data: T): void {
  if (!world.entities.has(entity)) {
    throw new Error(`Entity ${entity} does not exist`);
  }

  let componentMap = world.components.get(component);
  if (!componentMap) {
    componentMap = new Map();
    world.components.set(component, componentMap);
  }

  componentMap.set(entity, data);
}

/**
 * Get a component from an entity
 */
export function get<T>(world: World, component: ComponentType<T>, entity: EntityId): T | undefined {
  const componentMap = world.components.get(component);
  if (!componentMap) {
    return undefined;
  }
  return componentMap.get(entity) as T | undefined;
}

/**
 * Check if an entity has a component
 */
export function has(world: World, component: ComponentType<any>, entity: EntityId): boolean {
  const componentMap = world.components.get(component);
  return componentMap ? componentMap.has(entity) : false;
}

/**
 * Remove a component from an entity
 */
export function remove(world: World, component: ComponentType<any>, entity: EntityId): void {
  const componentMap = world.components.get(component);
  if (componentMap) {
    componentMap.delete(entity);
  }
}

/**
 * Query entities with specific components (1 component)
 */
export function query<T1>(world: World, c1: ComponentType<T1>): Iterable<[EntityId, T1]> {
  const map1 = world.components.get(c1);
  if (!map1) {
    return [];
  }

  const results: [EntityId, T1][] = [];
  for (const [entity, data1] of map1) {
    if (world.entities.has(entity)) {
      results.push([entity, data1 as T1]);
    }
  }
  return results;
}

/**
 * Query entities with specific components (2 components)
 */
export function query2<T1, T2>(
  world: World,
  c1: ComponentType<T1>,
  c2: ComponentType<T2>,
): Iterable<[EntityId, T1, T2]> {
  const map1 = world.components.get(c1);
  const map2 = world.components.get(c2);

  if (!map1 || !map2) {
    return [];
  }

  const results: [EntityId, T1, T2][] = [];
  for (const [entity, data1] of map1) {
    if (world.entities.has(entity)) {
      const data2 = map2.get(entity);
      if (data2 !== undefined) {
        results.push([entity, data1 as T1, data2 as T2]);
      }
    }
  }
  return results;
}

/**
 * Query entities with specific components (3 components)
 */
export function query3<T1, T2, T3>(
  world: World,
  c1: ComponentType<T1>,
  c2: ComponentType<T2>,
  c3: ComponentType<T3>,
): Iterable<[EntityId, T1, T2, T3]> {
  const map1 = world.components.get(c1);
  const map2 = world.components.get(c2);
  const map3 = world.components.get(c3);

  if (!map1 || !map2 || !map3) {
    return [];
  }

  const results: [EntityId, T1, T2, T3][] = [];
  for (const [entity, data1] of map1) {
    if (world.entities.has(entity)) {
      const data2 = map2.get(entity);
      const data3 = map3.get(entity);
      if (data2 !== undefined && data3 !== undefined) {
        results.push([entity, data1 as T1, data2 as T2, data3 as T3]);
      }
    }
  }
  return results;
}

/**
 * Query entities with specific components (4 components)
 */
export function query4<T1, T2, T3, T4>(
  world: World,
  c1: ComponentType<T1>,
  c2: ComponentType<T2>,
  c3: ComponentType<T3>,
  c4: ComponentType<T4>,
): Iterable<[EntityId, T1, T2, T3, T4]> {
  const map1 = world.components.get(c1);
  const map2 = world.components.get(c2);
  const map3 = world.components.get(c3);
  const map4 = world.components.get(c4);

  if (!map1 || !map2 || !map3 || !map4) {
    return [];
  }

  const results: [EntityId, T1, T2, T3, T4][] = [];
  for (const [entity, data1] of map1) {
    if (world.entities.has(entity)) {
      const data2 = map2.get(entity);
      const data3 = map3.get(entity);
      const data4 = map4.get(entity);
      if (data2 !== undefined && data3 !== undefined && data4 !== undefined) {
        results.push([entity, data1 as T1, data2 as T2, data3 as T3, data4 as T4]);
      }
    }
  }
  return results;
}

/**
 * Count entities in the world
 */
export function entityCount(world: World): number {
  return world.entities.size;
}

/**
 * Clear all entities and components
 */
export function clear(world: World): void {
  world.entities.clear();
  world.components.clear();
  world.nextEntityId = 0;
}

/**
 * Create an entity ID from a string or number
 */
export function createEntityId(id: string | number): EntityId {
  return String(id);
}
