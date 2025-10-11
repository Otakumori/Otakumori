// DEPRECATED: This component is a duplicate. Use app\mini-games\bubble-girl\Game.tsx instead.
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

type Props = {
  mode: 'classic' | 'storm' | 'endless';
};

interface GameState {
  score: number;
  combo: number;
  multiplier: number;
  misses: number;
  timeLeft: number;
  isRunning: boolean;
  isGameOver: boolean;
  isStunned: boolean;
  stormMode: boolean;
}

interface Petal {
  id: string;
  x: number;
  y: number;
  type: 'normal' | 'gold' | 'cursed';
  speed: number;
  size: number;
  rotation: number;
  fallSpeed: number;
}

interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'slow_time' | 'combo_boost' | 'miss_forgive';
  duration: number;
  active: boolean;
}

export default function Game({ mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    multiplier: 1,
    misses: 0,
    timeLeft: mode === 'endless' ? 999 : 60,
    isRunning: true,
    isGameOver: false,
    isStunned: false,
    stormMode: false,
  });

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    const game = new GameEngine(canvas, mode);
    gameRef.current = game;

    // Start game loop
    let animationId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (gameState.isRunning && !gameState.isStunned) {
        game.update(deltaTime);
        game.render();

        // Update game state
        setGameState((prev) => ({
          ...prev,
          score: game.getScore(),
          combo: game.getCombo(),
          multiplier: game.getMultiplier(),
          misses: game.getMisses(),
          timeLeft: mode === 'endless' ? 999 : Math.max(0, 60 - game.getTime()),
          stormMode: game.isStormMode(),
        }));

        // Check game over conditions
        if (game.getMisses() >= 3 || (mode !== 'endless' && game.getTime() >= 60)) {
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
  }, [mode]);

  // Handle mouse/touch slash mechanics
  const slashPoints = useRef<{ x: number; y: number; time: number }[]>([]);
  const isSlashing = useRef(false);

  const handleMouseDown = useCallback((_event: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState.isStunned) return;
    isSlashing.current = true;
    slashPoints.current = [];
  }, [gameState.isStunned]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSlashing.current || !canvasRef.current || !gameRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    slashPoints.current.push({ x, y, time: Date.now() });

    // Keep only last 10 points
    if (slashPoints.current.length > 10) {
      slashPoints.current.shift();
    }

    // Check if slash hits any petals
    const hitPetals = gameRef.current.getPetalsAlongPath(slashPoints.current);
    hitPetals.forEach((petal) => {
      gameRef.current!.slashPetal(petal);
    });

    // Draw slash trail
    gameRef.current.setSlashTrail(slashPoints.current);
  }, []);

  const handleMouseUp = useCallback(() => {
    isSlashing.current = false;
    slashPoints.current = [];
    if (gameRef.current) {
      gameRef.current.clearSlashTrail();
    }
  }, []);

  // Handle power-up activation
  const handlePowerUpClick = useCallback((powerUpType: string) => {
    if (gameRef.current) {
      gameRef.current.activatePowerUp(powerUpType);
    }
  }, []);

  // Submit score and award petals when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      const submitScore = async () => {
        try {
          // Calculate petal reward (score / 10)
          const petalReward = Math.floor(gameState.score / 10);

          // Submit score to leaderboard
          await fetch('/api/v1/leaderboards/petal-samurai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              score: gameState.score,
              combo: gameState.combo,
              mode: mode,
              metadata: {
                multiplier: gameState.multiplier,
                misses: gameState.misses,
              },
            }),
          });

          // Award petals
          if (petalReward > 0) {
            await fetch('/api/v1/petals/collect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: petalReward,
                source: 'game_reward',
              }),
            });
          }
        } catch (error) {
          console.error('Failed to submit score:', error);
        }
      };
      submitScore();
    }
  }, [gameState.isGameOver, gameState.score, gameState.combo, gameState.multiplier, gameState.misses, mode]);

  return (
    <div className="relative">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        aria-label="Petal Samurai game area - slash through petals to score"
      />

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 flex gap-4">
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Score: {gameState.score}
        </div>
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Combo: {gameState.combo}x{gameState.multiplier.toFixed(1)}
        </div>
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Misses: {gameState.misses}/3
        </div>
        {mode !== 'endless' && (
          <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
            Time: {Math.ceil(gameState.timeLeft)}s
          </div>
        )}
        {gameState.stormMode && (
          <div className="bg-red-500/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm animate-pulse">
            STORM MODE!
          </div>
        )}
      </div>

      {/* Power-ups */}
      <div className="absolute top-4 right-4 flex gap-2">
        <motion.button
          className="px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded text-blue-200 text-xs hover:bg-blue-500/30 transition-colors"
          onClick={() => handlePowerUpClick('slow_time')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Slow Time
        </motion.button>
        <motion.button
          className="px-3 py-1 bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded text-green-200 text-xs hover:bg-green-500/30 transition-colors"
          onClick={() => handlePowerUpClick('combo_boost')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Combo Boost
        </motion.button>
      </div>

      {/* Stun Effect */}
      {gameState.isStunned && (
        <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center">
          <div className="text-2xl font-bold text-red-500 animate-pulse">STUNNED!</div>
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
              {gameState.misses >= 3 ? 'Game Over!' : "Time's Up!"}
            </h2>
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">Final Score: {gameState.score}</p>
              <p className="text-gray-600">Best Combo: {gameState.combo}x</p>
              <p className="text-gray-600">Multiplier: {gameState.multiplier.toFixed(1)}x</p>
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
  private combo: number = 0;
  private multiplier: number = 1;
  private misses: number = 0;
  private gameTime: number = 0;
  private petals: Petal[] = [];
  private powerUps: PowerUp[] = [];
  private activePowerUps: Map<string, number> = new Map();
  private baseSpeed: number = 1.0;
  private stormMode: boolean = false;
  private stunTime: number = 0;
  private animationId: number | null = null;
  private lastPetalSpawn: number = 0;
  private lastPowerUpSpawn: number = 0;
  private slashTrail: { x: number; y: number; time: number }[] = [];
  private slashedPetals: Set<string> = new Set();

  constructor(canvas: HTMLCanvasElement, mode: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.mode = mode;

    this.startGameLoop();
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
    this.gameTime += deltaTime;

    // Update stun timer
    if (this.stunTime > 0) {
      this.stunTime -= deltaTime;
      return;
    }

    // Speed scaling - ramps up every 20 seconds
    this.baseSpeed = 1.0 + Math.floor(this.gameTime / 20) * 0.3;

    // Storm mode after 60 seconds
    if (this.gameTime >= 60 && !this.stormMode) {
      this.stormMode = true;
    }

    // Spawn petals
    const spawnRate = this.stormMode ? 0.3 : 0.8;
    if (this.gameTime - this.lastPetalSpawn > spawnRate) {
      this.spawnPetal();
      this.lastPetalSpawn = this.gameTime;
    }

    // Spawn power-ups occasionally
    if (this.gameTime - this.lastPowerUpSpawn > 15 && Math.random() < 0.1) {
      this.spawnPowerUp();
      this.lastPowerUpSpawn = this.gameTime;
    }

    // Update petals
    this.petals.forEach((petal) => {
      petal.y += petal.fallSpeed * this.baseSpeed;
      petal.rotation += 0.1;
    });

    // Remove off-screen petals and count as misses
    this.petals = this.petals.filter((petal) => {
      if (petal.y > this.canvas.height) {
        if (petal.type !== 'cursed') {
          this.misses++;
          this.combo = 0;
          this.multiplier = 1;
        }
        return false;
      }
      return true;
    });

    // Update power-ups
    this.powerUps.forEach((powerUp) => {
      powerUp.y += 2;
    });

    // Remove off-screen power-ups
    this.powerUps = this.powerUps.filter((powerUp) => powerUp.y < this.canvas.height + 50);

    // Update active power-ups
    this.activePowerUps.forEach((timeLeft, type) => {
      const newTime = timeLeft - deltaTime;
      if (newTime <= 0) {
        this.activePowerUps.delete(type);
      } else {
        this.activePowerUps.set(type, newTime);
      }
    });
  }

  private spawnPetal() {
    const types: ('normal' | 'gold' | 'cursed')[] = [
      'normal',
      'normal',
      'normal',
      'normal',
      'gold',
      'cursed',
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    const petal: Petal = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (this.canvas.width - 40) + 20,
      y: -20,
      type,
      speed: 1,
      size: type === 'gold' ? 25 : type === 'cursed' ? 20 : 18,
      rotation: 0,
      fallSpeed: type === 'gold' ? 1.5 : type === 'cursed' ? 0.8 : 1.2,
    };

    this.petals.push(petal);
  }

  private spawnPowerUp() {
    const types: ('slow_time' | 'combo_boost' | 'miss_forgive')[] = [
      'slow_time',
      'combo_boost',
      'miss_forgive',
    ];
    const type = types[Math.floor(Math.random() * types.length)];

    const powerUp: PowerUp = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (this.canvas.width - 30) + 15,
      y: -30,
      type,
      duration: 5,
      active: false,
    };

    this.powerUps.push(powerUp);
  }

  slashPetal(petal: Petal) {
    // Prevent double-slashing the same petal
    if (this.slashedPetals.has(petal.id)) return;
    this.slashedPetals.add(petal.id);

    if (petal.type === 'cursed') {
      this.score = Math.max(0, this.score - 2);
      this.combo = 0;
      this.multiplier = 1;
      this.stunTime = 0.5;
    } else {
      const points = petal.type === 'gold' ? 5 : 1;
      this.score += Math.floor(points * this.multiplier);
      this.combo++;
      this.multiplier = Math.min(5, 1 + (this.combo - 1) * 0.2);

      if (petal.type === 'gold') {
        this.combo += 2; // Gold petals give extra combo
      }
    }

    // Remove slashed petal
    this.petals = this.petals.filter((p) => p.id !== petal.id);
  }

  getPetalsAlongPath(path: { x: number; y: number }[]): Petal[] {
    if (path.length < 2) return [];

    const hitPetals: Petal[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i];
      const p2 = path[i + 1];

      this.petals.forEach((petal) => {
        if (this.slashedPetals.has(petal.id)) return;

        // Check if petal intersects with line segment
        const distance = this.distanceToLineSegment(petal.x, petal.y, p1.x, p1.y, p2.x, p2.y);
        if (distance < petal.size + 5) {
          hitPetals.push(petal);
        }
      });
    }

    return hitPetals;
  }

  private distanceToLineSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;

    if (lengthSquared === 0) {
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    return Math.sqrt((px - closestX) * (px - closestX) + (py - closestY) * (py - closestY));
  }

  setSlashTrail(trail: { x: number; y: number; time: number }[]) {
    this.slashTrail = trail;
  }

  clearSlashTrail() {
    this.slashTrail = [];
    this.slashedPetals.clear();
  }

  activatePowerUp(type: string) {
    if (this.activePowerUps.has(type)) return;

    switch (type) {
      case 'slow_time':
        this.activePowerUps.set('slow_time', 5);
        break;
      case 'combo_boost':
        this.combo += 5;
        this.multiplier = Math.min(5, 1 + (this.combo - 1) * 0.2);
        break;
      case 'miss_forgive':
        this.misses = Math.max(0, this.misses - 1);
        break;
    }
  }

  getPetalAt(x: number, y: number): Petal | null {
    return (
      this.petals.find((petal) => {
        const distance = Math.sqrt(Math.pow(petal.x - x, 2) + Math.pow(petal.y - y, 2));
        return distance < petal.size;
      }) || null
    );
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background gradient
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, 'rgba(255, 182, 193, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw petals
    this.petals.forEach((petal) => {
      this.ctx.save();
      this.ctx.translate(petal.x, petal.y);
      this.ctx.rotate(petal.rotation);

      // Petal colors based on type
      switch (petal.type) {
        case 'normal':
          this.ctx.fillStyle = 'rgba(255, 182, 193, 0.8)';
          break;
        case 'gold':
          this.ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
          break;
        case 'cursed':
          this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
          break;
      }

      // Draw petal shape
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Add outline
      this.ctx.strokeStyle =
        petal.type === 'gold' ? 'rgba(255, 215, 0, 1)' : 'rgba(255, 255, 255, 0.6)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.restore();
    });

    // Draw power-ups
    this.powerUps.forEach((powerUp) => {
      this.ctx.save();
      this.ctx.translate(powerUp.x, powerUp.y);

      // Power-up colors
      switch (powerUp.type) {
        case 'slow_time':
          this.ctx.fillStyle = 'rgba(135, 206, 250, 0.8)';
          break;
        case 'combo_boost':
          this.ctx.fillStyle = 'rgba(50, 205, 50, 0.8)';
          break;
        case 'miss_forgive':
          this.ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
          break;
      }

      // Draw power-up shape
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    });

    // Draw slash trail effect
    if (this.slashTrail.length > 1) {
      this.ctx.save();
      
      // Create gradient trail
      const gradient = this.ctx.createLinearGradient(
        this.slashTrail[0].x,
        this.slashTrail[0].y,
        this.slashTrail[this.slashTrail.length - 1].x,
        this.slashTrail[this.slashTrail.length - 1].y
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(1, 'rgba(135, 206, 250, 0.9)');

      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 4;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = 'rgba(135, 206, 250, 0.8)';

      this.ctx.beginPath();
      this.ctx.moveTo(this.slashTrail[0].x, this.slashTrail[0].y);
      
      for (let i = 1; i < this.slashTrail.length; i++) {
        this.ctx.lineTo(this.slashTrail[i].x, this.slashTrail[i].y);
      }
      
      this.ctx.stroke();
      this.ctx.restore();
    }

    // Draw combo streak effect
    if (this.combo > 5) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.min(0.3, (this.combo - 5) * 0.02);
      this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
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
  getCombo(): number {
    return this.combo;
  }
  getMultiplier(): number {
    return this.multiplier;
  }
  getMisses(): number {
    return this.misses;
  }
  getTime(): number {
    return this.gameTime;
  }
  isStormMode(): boolean {
    return this.stormMode;
  }
}
