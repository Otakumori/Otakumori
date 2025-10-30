/**
 * React hook for game loop integration
 */
import type { World } from '../world';
import type { System } from '../system';
export interface UseGameLoopOptions {
  world: World;
  systems: System[];
  autoStart?: boolean;
  fixedDt?: number;
  maxAccumulator?: number;
}
export interface UseGameLoopResult {
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
export declare function useGameLoop(options: UseGameLoopOptions): UseGameLoopResult;
//# sourceMappingURL=useGameLoop.d.ts.map
