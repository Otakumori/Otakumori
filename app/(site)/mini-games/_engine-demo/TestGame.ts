/**
 * TestGame Implementation
 * Demonstrates the universal game runtime interface
 */

import type { Game, GameProgress, GameContext, GameResults } from '../_engine/types';

export class TestGame implements Game {
  private ctx: CanvasRenderingContext2D | null = null;
  private startTime: number = 0;
  private gameTime: number = 0;
  private score: number = 0;
  private x: number = 0;
  private y: number = 0;
  private velocityX: number = 0;
  private velocityY: number = 0;
  private isPaused: boolean = false;
  private assetsLoaded: boolean = false;
  private gameEndTime: number = 0;
  private shouldEnd: boolean = false;

  async preload(onProgress: (progress: GameProgress) => void): Promise<void> {
    // Simulate loading 5 assets
    const totalAssets = 5;
    let loaded = 0;

    for (let i = 0; i < totalAssets; i++) {
      // Simulate async asset loading
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200));

      loaded++;
      onProgress({
        loaded,
        total: totalAssets,
        percentage: (loaded / totalAssets) * 100,
      });
    }

    this.assetsLoaded = true;
  }

  start(context: GameContext): void {
    if (!context.canvas) {
      throw new Error('Canvas not available');
    }

    const ctx = context.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context');
    }

    this.ctx = ctx;
    this.startTime = performance.now();
    this.gameTime = 0;
    this.score = 0;
    this.shouldEnd = false;
    this.gameEndTime = 30; // End game after 30 seconds

    // Initialize player position (center of canvas)
    this.x = context.width / 2;
    this.y = context.height / 2;
    this.velocityX = 0;
    this.velocityY = 0;
    this.isPaused = false;

    // Set up canvas
    ctx.imageSmoothingEnabled = false; // Pixel art style
  }

  update(dt: number): void {
    if (this.isPaused || !this.ctx) {
      return;
    }

    this.gameTime += dt;

    // Simple movement with arrow keys
    const speed = 200; // pixels per second

    // Check keyboard state (simplified - in real game, use input manager)
    // For demo, we'll use simple physics instead
    this.velocityX *= 0.9; // Friction
    this.velocityY *= 0.9;

    // Update position
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    // Bounce off walls
    if (!this.ctx) return;
    const canvas = this.ctx.canvas;
    if (this.x < 0 || this.x > canvas.width) {
      this.velocityX *= -0.8;
      this.x = Math.max(0, Math.min(canvas.width, this.x));
    }
    if (this.y < 0 || this.y > canvas.height) {
      this.velocityY *= -0.8;
      this.y = Math.max(0, Math.min(canvas.height, this.y));
    }

    // Increment score over time
    this.score += Math.floor(dt * 10);

    // End game after gameEndTime seconds
    if (this.gameTime >= this.gameEndTime && !this.shouldEnd) {
      this.shouldEnd = true;
      // Signal to runtime that game should end
      // This will be handled by the runtime checking getResults
    }
  }

  shouldEndGame(): boolean {
    return this.shouldEnd;
  }

  render(context: GameContext): void {
    if (!this.ctx) {
      return;
    }

    const { canvas } = this.ctx;
    const { width, height, pixelRatio } = context;

    // Clear canvas
    this.ctx.fillStyle = '#080611';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    this.ctx.strokeStyle = '#1a1a2e';
    this.ctx.lineWidth = 1;
    const gridSize = 20 * pixelRatio;

    for (let x = 0; x < canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(canvas.width, y);
      this.ctx.stroke();
    }

    // Draw player (pink square)
    const playerSize = 20 * pixelRatio;
    this.ctx.fillStyle = '#ec4899';
    this.ctx.fillRect(
      this.x * pixelRatio - playerSize / 2,
      this.y * pixelRatio - playerSize / 2,
      playerSize,
      playerSize,
    );

    // Draw score
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `${16 * pixelRatio}px monospace`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(`Score: ${this.score}`, 10 * pixelRatio, 10 * pixelRatio);

    // Draw time
    this.ctx.fillText(`Time: ${this.gameTime.toFixed(1)}s`, 10 * pixelRatio, 30 * pixelRatio);

    // Draw instructions
    this.ctx.fillStyle = '#ffffff80';
    this.ctx.font = `${12 * pixelRatio}px monospace`;
    this.ctx.fillText('Click and drag to move', 10 * pixelRatio, canvas.height - 30 * pixelRatio);
    this.ctx.fillText('ESC to pause', 10 * pixelRatio, canvas.height - 15 * pixelRatio);
  }

  onPause(): void {
    this.isPaused = true;
  }

  onResume(): void {
    this.isPaused = false;
  }

  getResults(): GameResults {
    const durationMs = (performance.now() - this.startTime);
    return {
      score: this.score,
      stats: {
        time: this.gameTime,
        assetsLoaded: this.assetsLoaded,
      },
      durationMs,
    };
  }

  teardown(): void {
    this.ctx = null;
    this.assetsLoaded = false;
  }

  // Additional method for mouse input (called from outside)
  handleMouseMove(x: number, y: number): void {
    if (this.isPaused) return;

    // Convert screen coordinates to canvas coordinates
    const dx = x - this.x;
    const dy = y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const force = Math.min(distance * 0.1, 50);
      this.velocityX += (dx / distance) * force;
      this.velocityY += (dy / distance) * force;
    }
  }
}

