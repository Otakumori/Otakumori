/**
 * Fixed timestep game loop with accumulator
 * Runs at 60Hz with spiral-of-death protection
 */
const DEFAULT_FIXED_DT = 1 / 60; // 60 Hz
const DEFAULT_MAX_ACCUMULATOR = 0.2; // 200ms max
/**
 * Create a fixed timestep game loop
 */
export function createGameLoop(options) {
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
    // Visibility change handler
    const handleVisibilityChange = () => {
        if (document.hidden && isRunning && !isPaused) {
            pause();
        }
    };
    const tick = (currentTime) => {
        if (!isRunning) {
            return;
        }
        // Calculate delta time
        const deltaTime = lastTime === 0 ? fixedDt : (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        // Clamp to prevent spiral of death
        accumulator += Math.min(deltaTime, maxAccumulator);
        // Fixed timestep updates
        while (accumulator >= fixedDt) {
            // Run all systems
            for (const system of systems) {
                system(world, fixedDt);
            }
            accumulator -= fixedDt;
            currentTick++;
            if (onTick) {
                onTick(currentTick);
            }
        }
        // Calculate FPS
        fpsAccumulator += deltaTime;
        fpsFrames++;
        if (fpsAccumulator >= 1) {
            fps = fpsFrames;
            fpsFrames = 0;
            fpsAccumulator = 0;
        }
        // Continue loop
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
        // Listen for visibility changes
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
        lastTime = 0; // Reset time to prevent large delta
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
