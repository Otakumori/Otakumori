/**
 * Universal Game Runtime Types
 * Defines the interface all games must implement
 */

export type GameState = 'boot' | 'preload' | 'title' | 'play' | 'pause' | 'results' | 'persist';

export interface GameProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface GameResults {
  score: number;
  stats?: Record<string, unknown>;
  durationMs?: number;
}

export interface GameContext {
  canvas: HTMLCanvasElement | null;
  width: number;
  height: number;
  pixelRatio: number;
}

/**
 * Core Game Interface
 * All games must implement these methods
 */
export interface Game {
  /**
   * Preload assets and resources
   * Called during 'preload' state
   * @param onProgress Callback to report loading progress (0-1)
   * @returns Promise that resolves when preload is complete
   */
  preload(onProgress: (progress: GameProgress) => void): Promise<void>;

  /**
   * Initialize and start the game
   * Called when transitioning from 'title' to 'play'
   * @param context Game context with canvas and dimensions
   */
  start(context: GameContext): void;

  /**
   * Update game logic
   * Called every frame during 'play' state
   * @param dt Delta time in seconds since last frame
   */
  update(dt: number): void;

  /**
   * Render the game
   * Called every frame during 'play' state
   * @param context Game context with canvas
   */
  render(context: GameContext): void;

  /**
   * Called when game is paused
   * Use this to pause animations, audio, etc.
   */
  onPause(): void;

  /**
   * Called when game is resumed
   * Use this to resume animations, audio, etc.
   */
  onResume(): void;

  /**
   * Get current game results
   * Called when transitioning to 'results' state
   * @returns Game results with score and stats
   */
  getResults(): GameResults;

  /**
   * Cleanup and teardown
   * Called when game is being destroyed
   */
  teardown(): void;
}

/**
 * Game Runtime Configuration
 */
export interface GameRuntimeConfig {
  /** Game instance to run */
  game: Game;
  /** Game title for UI */
  title: string;
  /** Target FPS (default: 60) */
  targetFPS?: number;
  /** Enable fixed timestep (default: true) */
  fixedTimestep?: boolean;
  /** Fixed timestep delta in seconds (default: 1/60) */
  fixedDelta?: number;
}

