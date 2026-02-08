/**
 * Universal Game Runtime
 * Manages game lifecycle state machine and RAF loop
 * 
 * State flow: Boot → Preload → Title → Play → Pause → Results → Persist
 */

import type { Game, GameState, GameProgress, GameContext, GameResults } from './types';

export interface GameRuntimeCallbacks {
  onStateChange?: (state: GameState) => void;
  onProgress?: (progress: GameProgress) => void;
  onResults?: (results: GameResults) => void;
}

export class GameRuntime {
  private state: GameState = 'boot';
  private game: Game;
  private title: string;
  private targetFPS: number;
  private fixedTimestep: boolean;
  private fixedDelta: number;

  private canvas: HTMLCanvasElement | null = null;
  private context: GameContext | null = null;
  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private accumulator: number = 0;

  private callbacks: GameRuntimeCallbacks = {};

  // Performance tracking
  private frameCount: number = 0;
  private lastFPSUpdate: number = 0;
  private currentFPS: number = 0;

  constructor(
    game: Game,
    title: string,
    options: {
      targetFPS?: number;
      fixedTimestep?: boolean;
      fixedDelta?: number;
    } = {},
  ) {
    this.game = game;
    this.title = title;
    this.targetFPS = options.targetFPS ?? 60;
    this.fixedTimestep = options.fixedTimestep ?? true;
    this.fixedDelta = options.fixedDelta ?? 1 / 60;
  }

  /**
   * Set callbacks for runtime events
   */
  setCallbacks(callbacks: GameRuntimeCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Initialize runtime with canvas element
   */
  initialize(canvas: HTMLCanvasElement): void {
    if (this.canvas) {
      throw new Error('GameRuntime already initialized');
    }

    this.canvas = canvas;
    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.context = {
      canvas,
      width: rect.width,
      height: rect.height,
      pixelRatio,
    };

    // Set canvas size accounting for pixel ratio
    canvas.width = rect.width * pixelRatio;
    canvas.height = rect.height * pixelRatio;

    // Start boot sequence
    this.transitionTo('preload');
  }

  /**
   * Get current state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.currentFPS;
  }

  /**
   * Start preloading
   */
  async startPreload(): Promise<void> {
    if (this.state !== 'preload') {
      return;
    }

    try {
      await this.game.preload((progress) => {
        this.callbacks.onProgress?.(progress);
      });

      // Preload complete, transition to title
      this.transitionTo('title');
    } catch (error) {
      console.error('[GameRuntime] Preload failed:', error);
      // Could transition to error state here
      throw error;
    }
  }

  /**
   * Start the game (transition from title to play)
   */
  startGame(): void {
    if (this.state !== 'title') {
      return;
    }

    if (!this.context) {
      throw new Error('GameRuntime not initialized');
    }

    this.game.start(this.context);
    this.transitionTo('play');
    this.startGameLoop();
  }

  /**
   * Pause the game
   */
  pause(): void {
    if (this.state !== 'play') {
      return;
    }

    this.game.onPause();
    this.transitionTo('pause');
    this.stopGameLoop();
  }

  /**
   * Resume the game
   */
  resume(): void {
    if (this.state !== 'pause') {
      return;
    }

    this.game.onResume();
    this.transitionTo('play');
    this.startGameLoop();
  }

  /**
   * End the game and show results
   */
  endGame(): void {
    if (this.state !== 'play') {
      return;
    }

    this.stopGameLoop();
    const results = this.game.getResults();
    this.callbacks.onResults?.(results);
    this.transitionTo('results');
  }

  /**
   * Persist game data (save to backend)
   */
  async persist(): Promise<void> {
    if (this.state !== 'results') {
      return;
    }

    this.transitionTo('persist');
    // Persist logic would go here (API calls, etc.)
    // For now, just a placeholder
  }

  /**
   * Restart the game
   */
  restart(): void {
    this.stopGameLoop();
    this.game.teardown();
    this.transitionTo('title');
  }

  /**
   * Cleanup and destroy runtime
   */
  destroy(): void {
    this.stopGameLoop();
    this.game.teardown();
    this.canvas = null;
    this.context = null;
    this.state = 'boot';
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: GameState): void {
    if (this.state === newState) {
      return;
    }

    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  /**
   * Start the game loop (RAF)
   */
  private startGameLoop(): void {
    if (this.animationFrameId !== null) {
      return; // Already running
    }

    this.lastFrameTime = performance.now();
    this.accumulator = 0;
    this.frameCount = 0;
    this.lastFPSUpdate = this.lastFrameTime;

    const loop = (currentTime: number) => {
      if (this.state !== 'play' || !this.context) {
        this.animationFrameId = null;
        return;
      }

      const deltaTime = (currentTime - this.lastFrameTime) / 1000; // Convert to seconds
      this.lastFrameTime = currentTime;

      // Update FPS counter
      this.frameCount++;
      if (currentTime - this.lastFPSUpdate >= 1000) {
        this.currentFPS = this.frameCount;
        this.frameCount = 0;
        this.lastFPSUpdate = currentTime;
      }

      if (this.fixedTimestep) {
        // Fixed timestep with accumulator
        this.accumulator += deltaTime;
        const maxFrameTime = 0.25; // Cap to prevent spiral of death

        while (this.accumulator >= this.fixedDelta && this.state === 'play') {
          this.game.update(this.fixedDelta);
          this.accumulator -= this.fixedDelta;

          // Safety check to prevent infinite loop
          if (this.accumulator > maxFrameTime) {
            this.accumulator = this.fixedDelta;
            break;
          }
        }
      } else {
        // Variable timestep
        this.game.update(deltaTime);
      }

      // Render
      this.game.render(this.context);

      // Continue loop
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Stop the game loop
   */
  private stopGameLoop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

