/**
 * Fixed timestep game loop with accumulator
 * Runs at 60Hz with spiral-of-death protection
 */
import type { World } from './world';
import type { System } from './system';
export interface GameLoop {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    isRunning: boolean;
    isPaused: boolean;
    currentTick: number;
    fps: number;
}
export interface GameLoopOptions {
    world: World;
    systems: System[];
    fixedDt?: number;
    maxAccumulator?: number;
    onTick?: (tick: number) => void;
}
/**
 * Create a fixed timestep game loop
 */
export declare function createGameLoop(options: GameLoopOptions): GameLoop;
//# sourceMappingURL=loop.d.ts.map