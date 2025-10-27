import { W as World, S as System } from './system-DWaf5ibd.cjs';
export { C as ComponentType, E as EntityId, l as SystemScheduler, b as add, n as addSystem, k as clear, t as clearSystems, m as createScheduler, c as createWorld, d as defineComponent, a as despawn, j as entityCount, g as get, h as has, q as query, e as query2, f as query3, i as query4, r as remove, o as removeSystem, p as runSystems, s as spawn } from './system-DWaf5ibd.cjs';

/**
 * Fixed timestep game loop with accumulator
 * Runs at 60Hz with spiral-of-death protection
 */

interface GameLoop {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    isRunning: boolean;
    isPaused: boolean;
    currentTick: number;
    fps: number;
}
interface GameLoopOptions {
    world: World;
    systems: System[];
    fixedDt?: number;
    maxAccumulator?: number;
    onTick?: (tick: number) => void;
}
/**
 * Create a fixed timestep game loop
 */
declare function createGameLoop(options: GameLoopOptions): GameLoop;

export { type GameLoop, type GameLoopOptions, System, World, createGameLoop };
