// DEPRECATED: This component is a duplicate. Use app\mini-games\bubble-girl\Game.tsx instead.
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameControls, { CONTROL_PRESETS } from '@/components/GameControls';

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

  const handleMouseDown = useCallback(
    (_event: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameState.isStunned) return;
      isSlashing.current = true;
      slashPoints.current = [];
    },
    [gameState.isStunned],
  );

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSlashing.current || !canvasRef.current || !gameRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Calculate proper canvas-relative coordinates accounting for canvas scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    slashPoints.current.push({ x, y, time: Date.now() });

    // Keep only last 15 points for smoother trail
    if (slashPoints.current.length > 15) {
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
  }, [
    gameState.isGameOver,
    gameState.score,
    gameState.combo,
    gameState.multiplier,
    gameState.misses,
    mode,
  ]);

  return (
    <div className="relative">
      {/* Keyboard Controls Display */}
      <GameControls
        game="Petal Samurai"
        controls={[...CONTROL_PRESETS['petal-samurai']]}
        position="bottom-left"
        autoHideDelay={8000}
      />

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto cursor-crosshair rounded-2xl border border-pink-500/20 shadow-2xl"
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

    // Fade slash trail dynamically over time
    const now = this.gameTime;
    this.slashTrail = this.slashTrail.filter((point) => {
      const age = now - point.time;
      return age < 0.3; // Trail fades after 300ms
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

  private distanceToLineSegment(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): number {
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
    // CLEAR canvas properly (CRITICAL FIX)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background gradient (PREMIUM - layered gradients for depth)
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    bgGradient.addColorStop(0, '#1a0d2e'); // Deep purple-black
    bgGradient.addColorStop(0.3, '#2e0b1a'); // Dark sakura pink
    bgGradient.addColorStop(0.7, '#3d0a1f'); // Deep red-black
    bgGradient.addColorStop(1, '#0f0718'); // Near black
    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Atmospheric particles (ambient petals)
    this.renderAtmosphericPetals();

    // Draw premium samurai character
    this.renderSamuraiCharacter();

    // Draw petals
    this.petals.forEach((petal) => {
      this.ctx.save();
      this.ctx.translate(petal.x, petal.y);
      this.ctx.rotate(petal.rotation);

      // Petal colors based on type - all pink themed
      switch (petal.type) {
        case 'normal':
          this.ctx.fillStyle = 'rgba(255, 182, 193, 0.9)'; // Light pink
          break;
        case 'gold':
          this.ctx.fillStyle = 'rgba(255, 105, 180, 1.0)'; // Hot pink for gold
          break;
        case 'cursed':
          this.ctx.fillStyle = 'rgba(139, 0, 139, 0.9)'; // Dark magenta for cursed
          break;
      }

      // Draw petal shape
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Add outline - pink themed
      this.ctx.strokeStyle =
        petal.type === 'gold' ? 'rgba(255, 20, 147, 1)' : 'rgba(255, 182, 193, 0.8)';
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

    // Draw slash trail effect - dynamic fading based on age
    if (this.slashTrail.length > 1) {
      this.ctx.save();

      const now = this.gameTime;

      // Draw multiple layers for better effect
      for (let layer = 0; layer < 3; layer++) {
        this.ctx.beginPath();

        for (let i = 0; i < this.slashTrail.length - 1; i++) {
          const point = this.slashTrail[i];
          const nextPoint = this.slashTrail[i + 1];

          // Calculate age-based opacity (newer = more visible)
          const age = now - point.time;
          const fadeProgress = Math.max(0, 1 - age / 0.3); // Fade over 300ms
          const layerOpacity = ((3 - layer) / 3) * fadeProgress;

          // Dynamic width based on age and layer
          const baseWidth = 12 - layer * 3;
          const width = baseWidth * fadeProgress;

          if (width > 0.5 && layerOpacity > 0.01) {
            // Create gradient for this segment
            const gradient = this.ctx.createLinearGradient(
              point.x,
              point.y,
              nextPoint.x,
              nextPoint.y,
            );
            gradient.addColorStop(0, `rgba(255, 20, 147, ${0.8 * layerOpacity})`);
            gradient.addColorStop(0.5, `rgba(255, 105, 180, ${0.95 * layerOpacity})`);
            gradient.addColorStop(1, `rgba(255, 182, 193, ${0.7 * layerOpacity})`);

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = width;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.shadowBlur = (25 + layer * 15) * fadeProgress;
            this.ctx.shadowColor = `rgba(255, 105, 180, ${0.7 * layerOpacity})`;

            // Draw smooth curved segment
            this.ctx.beginPath();
            this.ctx.moveTo(point.x, point.y);

            const midX = (point.x + nextPoint.x) / 2;
            const midY = (point.y + nextPoint.y) / 2;
            this.ctx.quadraticCurveTo(point.x, point.y, midX, midY);
            this.ctx.lineTo(nextPoint.x, nextPoint.y);
            this.ctx.stroke();
          }
        }
      }

      this.ctx.restore();
    }

    // Draw combo streak effect - pink glow
    if (this.combo > 5) {
      this.ctx.save();
      this.ctx.globalAlpha = Math.min(0.2, (this.combo - 5) * 0.015);
      this.ctx.fillStyle = 'rgba(255, 105, 180, 0.3)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }
  }

  private renderAtmosphericPetals() {
    // Ambient floating petals in background
    const petalCount = 15;
    for (let i = 0; i < petalCount; i++) {
      const x = (this.gameTime * 20 + i * 50) % (this.canvas.width + 100);
      const y = (this.gameTime * 15 + i * 40) % this.canvas.height;
      const size = 4 + (i % 3) * 2;
      const alpha = 0.1 + Math.sin(this.gameTime + i) * 0.05;

      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = '#ffc7d9';
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, size, size * 0.6, (this.gameTime + i) * 0.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private renderSamuraiCharacter() {
    // Premium samurai character in bottom-center
    const centerX = this.canvas.width / 2;
    const baseY = this.canvas.height - 80;

    // Character stance animation (subtle breathing/idle)
    const breatheOffset = Math.sin(this.gameTime * 2) * 2;
    const slashPose = this.slashTrail.length > 0;

    // Shadow
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;
    this.ctx.fillStyle = '#000000';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, baseY + 60, 40, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();

    // Body (kimono with detailed gradients)
    const bodyGradient = this.ctx.createLinearGradient(
      centerX - 40,
      baseY - 20,
      centerX + 40,
      baseY + 50,
    );
    bodyGradient.addColorStop(0, '#c1185b');
    bodyGradient.addColorStop(0.5, '#e91e63');
    bodyGradient.addColorStop(1, '#ad1457');

    this.ctx.save();
    this.ctx.translate(0, breatheOffset);
    this.ctx.fillStyle = bodyGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, baseY - 10);
    this.ctx.lineTo(centerX - 45, baseY + 10);
    this.ctx.lineTo(centerX - 40, baseY + 55);
    this.ctx.lineTo(centerX + 40, baseY + 55);
    this.ctx.lineTo(centerX + 45, baseY + 10);
    this.ctx.closePath();
    this.ctx.fill();

    // Kimono details (obi belt)
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(centerX - 40, baseY + 15, 80, 12);
    this.ctx.strokeStyle = '#b8860b';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(centerX - 40, baseY + 15, 80, 12);

    // Shoulders/sleeves
    this.ctx.fillStyle = '#d81b60';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX - 28, baseY - 5, 18, 12, -0.3, 0, Math.PI * 2);
    this.ctx.ellipse(centerX + 28, baseY - 5, 18, 12, 0.3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();

    // Head (detailed anime-style face)
    this.ctx.save();
    this.ctx.translate(0, breatheOffset);

    // Head shape with gradient
    const headGradient = this.ctx.createRadialGradient(
      centerX,
      baseY - 35,
      0,
      centerX,
      baseY - 35,
      25,
    );
    headGradient.addColorStop(0, '#ffe0e6');
    headGradient.addColorStop(1, '#ffc7d9');

    this.ctx.fillStyle = headGradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, baseY - 35, 25, 0, Math.PI * 2);
    this.ctx.fill();

    // Hair (detailed with multiple layers)
    this.ctx.fillStyle = '#2c1810';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX, baseY - 45, 28, 20, 0, 0, Math.PI, true);
    this.ctx.fill();

    // Hair strands (detailed)
    this.ctx.strokeStyle = '#1a0f0a';
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(centerX + i * 8, baseY - 50);
      this.ctx.lineTo(centerX + i * 10, baseY - 30);
      this.ctx.stroke();
    }

    // Eyes (detailed anime style)
    const eyeY = baseY - 38;
    const eyeSpacing = 10;

    // Left eye
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX - eyeSpacing, eyeY, 5, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#4a90e2';
    this.ctx.beginPath();
    this.ctx.arc(centerX - eyeSpacing, eyeY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.beginPath();
    this.ctx.arc(centerX - eyeSpacing, eyeY, 2.5, 0, Math.PI * 2);
    this.ctx.fill();
    // Eye shine
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(centerX - eyeSpacing - 1, eyeY - 1, 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Right eye
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX + eyeSpacing, eyeY, 5, 7, 0, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#4a90e2';
    this.ctx.beginPath();
    this.ctx.arc(centerX + eyeSpacing, eyeY, 4, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.beginPath();
    this.ctx.arc(centerX + eyeSpacing, eyeY, 2.5, 0, Math.PI * 2);
    this.ctx.fill();
    // Eye shine
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(centerX + eyeSpacing + 1, eyeY - 1, 1.5, 0, Math.PI * 2);
    this.ctx.fill();

    // Blush
    this.ctx.fillStyle = 'rgba(255, 182, 193, 0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(centerX - 18, baseY - 32, 6, 4, 0, 0, Math.PI * 2);
    this.ctx.ellipse(centerX + 18, baseY - 32, 6, 4, 0, 0, Math.PI * 2);
    this.ctx.fill();

    // Mouth (subtle smile)
    this.ctx.strokeStyle = '#d946ef';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(centerX, baseY - 28, 6, 0.2, Math.PI - 0.2);
    this.ctx.stroke();

    this.ctx.restore();

    // Sword (katana) - positioned based on slash state
    this.ctx.save();
    this.ctx.translate(0, breatheOffset);

    const swordX = slashPose ? centerX + 35 : centerX + 25;
    const swordY = slashPose ? baseY - 10 : baseY + 5;
    const swordAngle = slashPose ? -Math.PI / 3 : Math.PI / 6;

    this.ctx.translate(swordX, swordY);
    this.ctx.rotate(swordAngle);

    // Sword handle
    const handleGradient = this.ctx.createLinearGradient(-2, 0, 2, 0);
    handleGradient.addColorStop(0, '#8b4513');
    handleGradient.addColorStop(0.5, '#a0522d');
    handleGradient.addColorStop(1, '#8b4513');
    this.ctx.fillStyle = handleGradient;
    this.ctx.fillRect(-2, -15, 4, 30);

    // Sword guard (tsuba)
    this.ctx.fillStyle = '#ffd700';
    this.ctx.fillRect(-8, -18, 16, 6);
    this.ctx.strokeStyle = '#b8860b';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(-8, -18, 16, 6);

    // Blade
    const bladeGradient = this.ctx.createLinearGradient(-1, -18, 1, -18);
    bladeGradient.addColorStop(0, '#c0c0c0');
    bladeGradient.addColorStop(0.5, '#ffffff');
    bladeGradient.addColorStop(1, '#c0c0c0');
    this.ctx.fillStyle = bladeGradient;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -20);
    this.ctx.lineTo(-3, -20);
    this.ctx.lineTo(-1.5, -65);
    this.ctx.lineTo(1.5, -65);
    this.ctx.lineTo(3, -20);
    this.ctx.closePath();
    this.ctx.fill();

    // Blade edge highlight
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -20);
    this.ctx.lineTo(0, -65);
    this.ctx.stroke();

    this.ctx.restore();

    // Power-up aura if active
    if (this.activePowerUps.size > 0) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.3 + Math.sin(this.gameTime * 5) * 0.1;
      this.ctx.strokeStyle = '#4ade80';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(centerX, baseY - 10 + breatheOffset, 60, 0, Math.PI * 2);
      this.ctx.stroke();
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
