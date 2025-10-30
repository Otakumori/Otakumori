"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  add: () => add,
  addSystem: () => addSystem,
  clear: () => clear,
  clearSystems: () => clearSystems,
  createGameLoop: () => createGameLoop,
  createScheduler: () => createScheduler,
  createWorld: () => createWorld,
  defineComponent: () => defineComponent,
  despawn: () => despawn,
  entityCount: () => entityCount,
  get: () => get,
  has: () => has,
  query: () => query,
  query2: () => query2,
  query3: () => query3,
  query4: () => query4,
  remove: () => remove,
  removeSystem: () => removeSystem,
  runSystems: () => runSystems,
  spawn: () => spawn
});
module.exports = __toCommonJS(index_exports);

// src/world.ts
function defineComponent(name) {
  return {
    __brand: Symbol(name),
    name
  };
}
function createWorld() {
  return {
    nextEntityId: 0,
    components: /* @__PURE__ */ new Map(),
    entities: /* @__PURE__ */ new Set()
  };
}
function spawn(world) {
  const id = world.nextEntityId++;
  world.entities.add(id);
  return id;
}
function despawn(world, entity) {
  if (!world.entities.has(entity)) {
    return;
  }
  world.entities.delete(entity);
  for (const componentMap of world.components.values()) {
    componentMap.delete(entity);
  }
}
function add(world, component, entity, data) {
  if (!world.entities.has(entity)) {
    throw new Error(`Entity ${entity} does not exist`);
  }
  let componentMap = world.components.get(component);
  if (!componentMap) {
    componentMap = /* @__PURE__ */ new Map();
    world.components.set(component, componentMap);
  }
  componentMap.set(entity, data);
}
function get(world, component, entity) {
  const componentMap = world.components.get(component);
  if (!componentMap) {
    return void 0;
  }
  return componentMap.get(entity);
}
function has(world, component, entity) {
  const componentMap = world.components.get(component);
  return componentMap ? componentMap.has(entity) : false;
}
function remove(world, component, entity) {
  const componentMap = world.components.get(component);
  if (componentMap) {
    componentMap.delete(entity);
  }
}
function query(world, c1) {
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
function query2(world, c1, c2) {
  const map1 = world.components.get(c1);
  const map2 = world.components.get(c2);
  if (!map1 || !map2) {
    return [];
  }
  const results = [];
  for (const [entity, data1] of map1) {
    if (world.entities.has(entity)) {
      const data2 = map2.get(entity);
      if (data2 !== void 0) {
        results.push([entity, data1, data2]);
      }
    }
  }
  return results;
}
function query3(world, c1, c2, c3) {
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
      if (data2 !== void 0 && data3 !== void 0) {
        results.push([entity, data1, data2, data3]);
      }
    }
  }
  return results;
}
function query4(world, c1, c2, c3, c4) {
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
      if (data2 !== void 0 && data3 !== void 0 && data4 !== void 0) {
        results.push([entity, data1, data2, data3, data4]);
      }
    }
  }
  return results;
}
function entityCount(world) {
  return world.entities.size;
}
function clear(world) {
  world.entities.clear();
  world.components.clear();
  world.nextEntityId = 0;
}

// src/system.ts
function createScheduler() {
  return {
    systems: [],
    enabled: true
  };
}
function addSystem(scheduler, system) {
  scheduler.systems.push(system);
}
function removeSystem(scheduler, system) {
  const index = scheduler.systems.indexOf(system);
  if (index !== -1) {
    scheduler.systems.splice(index, 1);
  }
}
function runSystems(scheduler, world, dt) {
  if (!scheduler.enabled) {
    return;
  }
  for (const system of scheduler.systems) {
    system(world, dt);
  }
}
function clearSystems(scheduler) {
  scheduler.systems = [];
}

// src/loop.ts
var DEFAULT_FIXED_DT = 1 / 60;
var DEFAULT_MAX_ACCUMULATOR = 0.2;
function createGameLoop(options) {
  const { world, systems, onTick } = options;
  const fixedDt = options.fixedDt ?? DEFAULT_FIXED_DT;
  const maxAccumulator = options.maxAccumulator ?? DEFAULT_MAX_ACCUMULATOR;
  let rafId = null;
  let isRunning = false;
  let isPaused = false;
  let lastTime = 0;
  let accumulator = 0;
  let currentTick = 0;
  let fps = 60;
  let fpsAccumulator = 0;
  let fpsFrames = 0;
  const handleVisibilityChange = () => {
    if (document.hidden && isRunning && !isPaused) {
      pause();
    }
  };
  const tick = (currentTime) => {
    if (!isRunning) {
      return;
    }
    const deltaTime = lastTime === 0 ? fixedDt : (currentTime - lastTime) / 1e3;
    lastTime = currentTime;
    accumulator += Math.min(deltaTime, maxAccumulator);
    while (accumulator >= fixedDt) {
      for (const system of systems) {
        system(world, fixedDt);
      }
      accumulator -= fixedDt;
      currentTick++;
      if (onTick) {
        onTick(currentTick);
      }
    }
    fpsAccumulator += deltaTime;
    fpsFrames++;
    if (fpsAccumulator >= 1) {
      fps = fpsFrames;
      fpsFrames = 0;
      fpsAccumulator = 0;
    }
    if (!isPaused) {
      rafId = requestAnimationFrame(tick);
    }
  };
  const start = () => {
    if (isRunning) {
      return;
    }
    isRunning = true;
    isPaused = false;
    lastTime = 0;
    accumulator = 0;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    rafId = requestAnimationFrame(tick);
  };
  const pause = () => {
    if (!isRunning || isPaused) {
      return;
    }
    isPaused = true;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
  const resume = () => {
    if (!isRunning || !isPaused) {
      return;
    }
    isPaused = false;
    lastTime = 0;
    accumulator = 0;
    rafId = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (!isRunning) {
      return;
    }
    isRunning = false;
    isPaused = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    lastTime = 0;
    accumulator = 0;
    currentTick = 0;
  };
  return {
    start,
    pause,
    resume,
    stop,
    get isRunning() {
      return isRunning;
    },
    get isPaused() {
      return isPaused;
    },
    get currentTick() {
      return currentTick;
    },
    get fps() {
      return fps;
    }
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  add,
  addSystem,
  clear,
  clearSystems,
  createGameLoop,
  createScheduler,
  createWorld,
  defineComponent,
  despawn,
  entityCount,
  get,
  has,
  query,
  query2,
  query3,
  query4,
  remove,
  removeSystem,
  runSystems,
  spawn
});
