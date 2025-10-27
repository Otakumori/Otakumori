/**
 * ECS World - Bevy-inspired Entity Component System
 * Stores entities and components with efficient querying
 */
/**
 * Create a component type identifier
 */
export function defineComponent(name) {
    return {
        __brand: Symbol(name),
        name,
    };
}
/**
 * Create a new world
 */
export function createWorld() {
    return {
        nextEntityId: 0,
        components: new Map(),
        entities: new Set(),
    };
}
/**
 * Spawn a new entity
 */
export function spawn(world) {
    const numericId = typeof world.nextEntityId === 'number'
        ? world.nextEntityId++
        : parseInt(world.nextEntityId, 10) || 0;
    const id = String(numericId);
    world.nextEntityId = numericId + 1;
    world.entities.add(id);
    return id;
}
/**
 * Despawn an entity and remove all its components
 */
export function despawn(world, entity) {
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
export function add(world, component, entity, data) {
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
export function get(world, component, entity) {
    const componentMap = world.components.get(component);
    if (!componentMap) {
        return undefined;
    }
    return componentMap.get(entity);
}
/**
 * Check if an entity has a component
 */
export function has(world, component, entity) {
    const componentMap = world.components.get(component);
    return componentMap ? componentMap.has(entity) : false;
}
/**
 * Remove a component from an entity
 */
export function remove(world, component, entity) {
    const componentMap = world.components.get(component);
    if (componentMap) {
        componentMap.delete(entity);
    }
}
/**
 * Query entities with specific components (1 component)
 */
export function query(world, c1) {
    const map1 = world.components.get(c1);
    if (!map1) {
        return [];
    }
    const results = [];
    for (const [entity, data1] of map1) {
        if (world.entities.has(entity)) {
            results.push([entity, data1]);
        }
    }
    return results;
}
/**
 * Query entities with specific components (2 components)
 */
export function query2(world, c1, c2) {
    const map1 = world.components.get(c1);
    const map2 = world.components.get(c2);
    if (!map1 || !map2) {
        return [];
    }
    const results = [];
    for (const [entity, data1] of map1) {
        if (world.entities.has(entity)) {
            const data2 = map2.get(entity);
            if (data2 !== undefined) {
                results.push([entity, data1, data2]);
            }
        }
    }
    return results;
}
/**
 * Query entities with specific components (3 components)
 */
export function query3(world, c1, c2, c3) {
    const map1 = world.components.get(c1);
    const map2 = world.components.get(c2);
    const map3 = world.components.get(c3);
    if (!map1 || !map2 || !map3) {
        return [];
    }
    const results = [];
    for (const [entity, data1] of map1) {
        if (world.entities.has(entity)) {
            const data2 = map2.get(entity);
            const data3 = map3.get(entity);
            if (data2 !== undefined && data3 !== undefined) {
                results.push([entity, data1, data2, data3]);
            }
        }
    }
    return results;
}
/**
 * Query entities with specific components (4 components)
 */
export function query4(world, c1, c2, c3, c4) {
    const map1 = world.components.get(c1);
    const map2 = world.components.get(c2);
    const map3 = world.components.get(c3);
    const map4 = world.components.get(c4);
    if (!map1 || !map2 || !map3 || !map4) {
        return [];
    }
    const results = [];
    for (const [entity, data1] of map1) {
        if (world.entities.has(entity)) {
            const data2 = map2.get(entity);
            const data3 = map3.get(entity);
            const data4 = map4.get(entity);
            if (data2 !== undefined && data3 !== undefined && data4 !== undefined) {
                results.push([entity, data1, data2, data3, data4]);
            }
        }
    }
    return results;
}
/**
 * Count entities in the world
 */
export function entityCount(world) {
    return world.entities.size;
}
/**
 * Clear all entities and components
 */
export function clear(world) {
    world.entities.clear();
    world.components.clear();
    world.nextEntityId = 0;
}
/**
 * Create an entity ID from a string or number
 */
export function createEntityId(id) {
    return String(id);
}
