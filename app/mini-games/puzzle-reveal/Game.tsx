'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';


type Props = {
  mode: 'classic' | 'blitz' | 'precision';
};

interface GameState {
  score: number;
  timeLeft: number;
  energy: number;
  revealedPercent: number;
  isRunning: boolean;
  isGameOver: boolean;
  brushSize: number;
  brushType: 'normal' | 'wind' | 'precision';
}

interface FogPixel {
  x: number;
  y: number;
  opacity: number;
  regrowTimer: number;
}

export default function Game({ mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: mode === 'blitz' ? 30 : mode === 'precision' ? 90 : 60,
    energy: 100,
    revealedPercent: 0,
    isRunning: true,
    isGameOver: false,
    brushSize: 20,
    brushType: 'normal',
  });

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const game = new GameEngine(canvas, mode);
    gameRef.current = game;

    // Start game loop
    let animationId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (gameState.isRunning) {
        game.update(deltaTime);
        game.render();

        // Update game state
        setGameState((prev) => ({
          ...prev,
          score: game.getScore(),
          timeLeft: Math.max(0, game.getTimeLeft()),
          energy: game.getEnergy(),
          revealedPercent: game.getRevealedPercent(),
          brushSize: game.getBrushSize(),
          brushType: game.getBrushType(),
        }));

        // Check game over conditions
        if (game.getTimeLeft() <= 0 || game.getRevealedPercent() >= 100) {
          setGameState((prev) => ({ ...prev, isRunning: false, isGameOver: true }));
          game.endGame();
        }
      }

      if (gameState.isRunning) {
        animationId = requestAnimationFrame(gameLoop);
      }
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      game.destroy();
    };
  }, [mode, gameState.isRunning]);

  // Handle mouse/touch interactions
  const handleCanvasInteraction = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!gameRef.current || gameState.energy <= 0) return;

      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();

      let x: number, y: number;
      if ('touches' in event) {
        x = event.touches[0].clientX - rect.left;
        y = event.touches[0].clientY - rect.top;
      } else {
        x = event.clientX - rect.left;
        y = event.clientY - rect.top;
      }

      gameRef.current.revealArea(x, y);
    },
    [gameState.energy],
  );

  // Handle brush upgrades
  const handleBrushUpgrade = useCallback((upgrade: string) => {
    if (gameRef.current) {
      gameRef.current.upgradeBrush(upgrade);
    }
  }, []);

  // Submit score when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      const submitScore = async () => {
        try {
          const payload = {
            score: gameState.score,
            revealedPercent: gameState.revealedPercent,
            mode: mode,
            meta: { game: 'puzzle-reveal' },
          };
          // TODO: Implement score submission API
          console.log('Score to submit:', payload);
        } catch (error) {
          console.error('Failed to submit score:', error);
        }
      };
      submitScore();
    }
  }, [gameState.isGameOver, gameState.score, gameState.revealedPercent, mode]);

  return (
    <div className="relative">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto cursor-crosshair"
        onMouseMove={handleCanvasInteraction}
        onTouchMove={handleCanvasInteraction}
        aria-label="Puzzle Reveal game area"
      />

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 flex gap-4">
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Score: {gameState.score}
        </div>
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Time: {Math.ceil(gameState.timeLeft)}s
        </div>
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Revealed: {Math.round(gameState.revealedPercent)}%
        </div>
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Energy: {Math.round(gameState.energy)}%
        </div>
      </div>

      {/* Brush Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          className="px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded text-blue-200 text-xs hover:bg-blue-500/30 transition-colors"
          onClick={() => handleBrushUpgrade('size')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Bigger Brush
        </motion.button>
        <motion.button
          className="px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded text-green-200 text-xs hover:bg-green-500/30 transition-colors"
          onClick={() => handleBrushUpgrade('wind')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Wind Brush
        </motion.button>
        <motion.button
          className="px-3 py-1 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded text-purple-200 text-xs hover:bg-purple-500/30 transition-colors"
          onClick={() => handleBrushUpgrade('precision')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Precision
        </motion.button>
      </div>

      {/* Energy Warning */}
      {gameState.energy <= 20 && (
        <div className="absolute bottom-4 left-4 bg-red-500/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm animate-pulse">
          Low Energy! Wait for recharge...
        </div>
      )}

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {gameState.revealedPercent >= 100 ? 'Puzzle Complete!' : "Time's Up!"}
            </h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">Final Score: {gameState.score}</p>
              <p className="text-gray-600">Revealed: {Math.round(gameState.revealedPercent)}%</p>
              <p className="text-gray-600">Mode: {mode}</p>
            </div>
            <motion.button
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Again
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Enhanced Game Engine Class
class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode: string;
  private score: number = 0;
  private timeLeft: number;
  private energy: number = 100;
  private revealedPercent: number = 0;
  private brushSize: number = 20;
  private brushType: 'normal' | 'wind' | 'precision' = 'normal';
  private fogPixels: FogPixel[][] = [];
  private hiddenImage: HTMLImageElement;
  private animationId: number | null = null;
  private lastEnergyRecharge: number = 0;

  constructor(canvas: HTMLCanvasElement, mode: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.mode = mode;
    this.timeLeft = mode === 'blitz' ? 30 : mode === 'precision' ? 90 : 60;

    // Initialize hidden image (placeholder for now)
    this.hiddenImage = new Image();
    this.hiddenImage.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmY2YmMxIi8+PGNpcmNsZSBjeD0iNDAwIiBjeT0iMzAwIiByPSIxMDAiIGZpbGw9IiNmZjY5YjQiLz48L3N2Zz4=';

    this.initializeFog();
    this.startGameLoop();
  }

  private initializeFog() {
    const pixelSize = 4;
    const cols = Math.ceil(this.canvas.width / pixelSize);
    const rows = Math.ceil(this.canvas.height / pixelSize);

    this.fogPixels = [];
    for (let y = 0; y < rows; y++) {
      this.fogPixels[y] = [];
      for (let x = 0; x < cols; x++) {
        this.fogPixels[y][x] = {
          x: x * pixelSize,
          y: y * pixelSize,
          opacity: 1,
          regrowTimer: 0,
        };
      }
    }
  }

  private startGameLoop() {
    const gameLoop = () => {
      this.update(1 / 60);
      this.render();
      this.animationId = requestAnimationFrame(gameLoop);
    };
    this.animationId = requestAnimationFrame(gameLoop);
  }

  update(deltaTime: number) {
    this.timeLeft -= deltaTime;

    // Recharge energy
    if (this.energy < 100) {
      this.energy = Math.min(100, this.energy + deltaTime * 10);
    }

    // Update fog regrowth
    this.fogPixels.forEach((row) => {
      row.forEach((pixel) => {
        if (pixel.opacity < 1) {
          pixel.regrowTimer += deltaTime;
          if (pixel.regrowTimer > 3) {
            // Regrow after 3 seconds
            pixel.opacity = Math.min(1, pixel.opacity + deltaTime * 0.5);
          }
        }
      });
    });

    // Calculate revealed percentage
    let revealedCount = 0;
    let totalPixels = 0;
    this.fogPixels.forEach((row) => {
      row.forEach((pixel) => {
        totalPixels++;
        if (pixel.opacity < 0.3) revealedCount++;
      });
    });
    this.revealedPercent = (revealedCount / totalPixels) * 100;

    // Update score based on revealed area
    this.score = Math.floor(this.revealedPercent * 10);
  }

  revealArea(x: number, y: number) {
    if (this.energy <= 0) return;

    const pixelSize = 4;
    const centerX = Math.floor(x / pixelSize);
    const centerY = Math.floor(y / pixelSize);
    const radius = Math.floor(this.brushSize / pixelSize);

    let energyCost = 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const pixelX = centerX + dx;
        const pixelY = centerY + dy;

        if (
          pixelX >= 0 &&
          pixelX < this.fogPixels[0].length &&
          pixelY >= 0 &&
          pixelY < this.fogPixels.length
        ) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            const pixel = this.fogPixels[pixelY][pixelX];
            const oldOpacity = pixel.opacity;

            // Different brush effects
            let revealAmount = 0.3;
            switch (this.brushType) {
              case 'wind':
                revealAmount = 0.2; // Weaker but wider
                break;
              case 'precision':
                revealAmount = 0.5; // Stronger but smaller
                break;
            }

            pixel.opacity = Math.max(0, pixel.opacity - revealAmount);
            pixel.regrowTimer = 0;

            if (pixel.opacity < oldOpacity) {
              energyCost += 0.5;
            }
          }
        }
      }
    }

    this.energy = Math.max(0, this.energy - energyCost);
  }

  upgradeBrush(upgrade: string) {
    switch (upgrade) {
      case 'size':
        this.brushSize = Math.min(50, this.brushSize + 5);
        break;
      case 'wind':
        this.brushType = 'wind';
        this.brushSize = 30;
        break;
      case 'precision':
        this.brushType = 'precision';
        this.brushSize = 15;
        break;
    }
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw hidden image
    this.ctx.drawImage(this.hiddenImage, 0, 0, this.canvas.width, this.canvas.height);

    // Draw fog overlay
    this.fogPixels.forEach((row) => {
      row.forEach((pixel) => {
        if (pixel.opacity > 0) {
          this.ctx.save();
          this.ctx.globalAlpha = pixel.opacity;
          this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          this.ctx.fillRect(pixel.x, pixel.y, 4, 4);
          this.ctx.restore();
        }
      });
    });

    // Draw brush preview
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.brushSize, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  endGame() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  getScore(): number {
    return this.score;
  }
  getTimeLeft(): number {
    return this.timeLeft;
  }
  getEnergy(): number {
    return this.energy;
  }
  getRevealedPercent(): number {
    return this.revealedPercent;
  }
  getBrushSize(): number {
    return this.brushSize;
  }
  getBrushType(): 'normal' | 'wind' | 'precision' {
    return this.brushType;
  }
}
