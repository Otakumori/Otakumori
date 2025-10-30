'use strict';
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all) __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === 'object') || typeof from === 'function') {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, '__esModule', { value: true }), mod);

// src/react/index.ts
var react_exports = {};
__export(react_exports, {
  useGameLoop: () => useGameLoop,
});
module.exports = __toCommonJS(react_exports);

// src/react/useGameLoop.ts
var import_react = require('react');

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
    document.addEventListener('visibilitychange', handleVisibilityChange);
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
    document.removeEventListener('visibilitychange', handleVisibilityChange);
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
    },
  };
}

// src/react/useGameLoop.ts
function useGameLoop(options) {
  const { world, systems, autoStart = false, fixedDt, maxAccumulator } = options;
  const loopRef = (0, import_react.useRef)(null);
  const [tick, setTick] = (0, import_react.useState)(0);
  const [fps, setFps] = (0, import_react.useState)(60);
  const [isRunning, setIsRunning] = (0, import_react.useState)(false);
  const [isPaused, setIsPaused] = (0, import_react.useState)(false);
  const loop = (0, import_react.useMemo)(() => {
    const options2 = {
      world,
      systems,
      onTick: (currentTick) => {
        setTick(currentTick);
        if (loopRef.current) {
          setFps(loopRef.current.fps);
        }
      },
    };
    if (fixedDt !== void 0) {
      options2.fixedDt = fixedDt;
    }
    if (maxAccumulator !== void 0) {
      options2.maxAccumulator = maxAccumulator;
    }
    const newLoop = createGameLoop(options2);
    loopRef.current = newLoop;
    return newLoop;
  }, [world, systems, fixedDt, maxAccumulator]);
  (0, import_react.useEffect)(() => {
    if (autoStart) {
      loop.start();
      setIsRunning(true);
    }
    return () => {
      if (loopRef.current) {
        loopRef.current.stop();
      }
    };
  }, [autoStart, loop]);
  const start = () => {
    loop.start();
    setIsRunning(true);
    setIsPaused(false);
  };
  const pause = () => {
    loop.pause();
    setIsPaused(true);
  };
  const resume = () => {
    loop.resume();
    setIsPaused(false);
  };
  const stop = () => {
    loop.stop();
    setIsRunning(false);
    setIsPaused(false);
  };
  return {
    start,
    pause,
    resume,
    stop,
    isRunning,
    isPaused,
    currentTick: tick,
    fps,
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 &&
  (module.exports = {
    useGameLoop,
  });
