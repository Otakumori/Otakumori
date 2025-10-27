import { W as World, S as System } from '../system-DWaf5ibd.cjs';

/**
 * React hook for game loop integration
 */

interface UseGameLoopOptions {
    world: World;
    systems: System[];
    autoStart?: boolean;
    fixedDt?: number;
    maxAccumulator?: number;
}
interface UseGameLoopResult {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    isRunning: boolean;
    isPaused: boolean;
    currentTick: number;
    fps: number;
}
/**
 * React hook for managing game loop lifecycle
 */
declare function useGameLoop(options: UseGameLoopOptions): UseGameLoopResult;

export { type UseGameLoopOptions, type UseGameLoopResult, useGameLoop };
