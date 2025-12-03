'use client';

import { logger } from '@/app/lib/logger';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
// import { COPY } from '../../lib/copy';

type Props = {
  skin: string;
  mode: 'sandbox' | 'challenge';
};

interface GameState {
  score: number;
  timeLeft: number;
  isRunning: boolean;
  isGameOver: boolean;
}

export default function Game({ skin, mode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeLeft: 60,
    isRunning: true,
    isGameOver: false,
  });

  // Initialize game engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const game = new GameEngine(canvas, skin, mode);
    gameRef.current = game;

    // Start game loop
    let animationId: number;
    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const _deltaTime = Math.min(0.033, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (gameState.isRunning) {
        game.update(_deltaTime);
        game.render();

        // Update score
        setGameState((prev) => ({
          ...prev,
          score: Math.round(game.getScore()),
          timeLeft: mode === 'challenge' ? Math.max(0, 60 - game.getTime()) : 60,
        }));

        // Check game over condition
        if (mode === 'challenge' && game.getTime() >= 60) {
          setGameState((prev) => ({ ...prev, isRunning: false, isGameOver: true }));
          game.endGame();
        }

        animationId = requestAnimationFrame(gameLoop);
      }
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
      game.destroy();
    };
  }, [skin, mode]);

  // Handle game controls
  const handleSpawnBubble = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.spawnBubble();
    }
  }, []);

  const handleToggleFans = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.toggleFans();
    }
  }, []);

  const handleReset = useCallback(() => {
    if (gameRef.current) {
      gameRef.current.reset();
      setGameState({
        score: 0,
        timeLeft: 60,
        isRunning: true,
        isGameOver: false,
      });
    }
  }, []);

  // Submit score when game ends
  useEffect(() => {
    if (gameState.isGameOver && mode === 'challenge') {
      const submitScore = async () => {
        try {
          await fetch('/api/v1/leaderboard/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              gameCode: 'bubble-girl',
              score: Math.max(0, Math.round(gameState.score)),
              meta: { duration: 60 },
            }),
          });
        } catch (error) {
          logger.error('Failed to submit score:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
        }
      };
      submitScore();
    }
  }, [gameState.isGameOver, gameState.score, gameState.isRunning, mode]);

  return (
    <div className="relative">
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-auto"
        aria-label="Bubble Girl game area"
      />

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 flex gap-4">
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          {mode === 'challenge' ? <>Time: {Math.ceil(gameState.timeLeft)}s</> : <>Sandbox</>}
        </div>
        <div className="bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg text-white text-sm">
          Score: {gameState.score}
        </div>
      </div>

      {/* Game Controls */}
      <div className="absolute bottom-4 left-4 flex gap-3 flex-wrap">
        <motion.button
          className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-700 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          onClick={handleSpawnBubble}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Spawn Bubble
        </motion.button>
        <motion.button
          className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-700 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          onClick={handleToggleFans}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Toggle Fans
        </motion.button>
        <motion.button
          className="px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/30 rounded-lg text-orange-700 hover:bg-orange-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
          onClick={() => gameRef.current?.spawnBubbleType('sticky')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Sticky Bubble
        </motion.button>
        <motion.button
          className="px-4 py-2 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-lg text-red-700 hover:bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
          onClick={() => gameRef.current?.spawnBubbleType('explosive')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Explosive Bubble
        </motion.button>
        <motion.button
          className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg text-purple-700 hover:bg-purple-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
          onClick={() => gameRef.current?.spawnBubbleType('gigantic')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Gigantic Bubble
        </motion.button>
        <motion.button
          className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-gray-700 hover:bg-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          onClick={handleReset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reset
        </motion.button>
      </div>

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center max-w-md mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Challenge Complete!</h2>
            <p className="text-gray-600 mb-6">Final Score: {gameState.score}</p>
            <motion.button
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
              onClick={handleReset}
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

// Game Engine Class (simplified for now)
class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private skin: string;
  private mode: string;
  private score: number = 0;
  private gameTime: number = 0;
  private bubbles: Bubble[] = [];
  private ragdoll: Ragdoll;
  private fans: boolean = false;
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement, skin: string, mode: string) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.skin = skin;
    this.mode = mode;

    // Initialize game objects
    this.ragdoll = new Ragdoll(canvas.width / 2, 60);
    this.spawnInitialBubbles();

    // Start game loop
    this.startGameLoop();
  }

  private spawnInitialBubbles() {
    for (let i = 0; i < 12; i++) {
      const types: ('normal' | 'sticky' | 'explosive' | 'gigantic')[] = [
        'normal',
        'normal',
        'normal',
        'sticky',
        'explosive',
      ];
      const type = types[Math.floor(Math.random() * types.length)];

      this.bubbles.push(
        new Bubble(
          Math.random() * this.canvas.width,
          this.canvas.height - 20,
          Math.random() * 20 + 16,
          type,
        ),
      );
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
    this.gameTime += deltaTime;

    // Update ragdoll
    this.ragdoll.update(deltaTime);

    // Update bubbles
    this.bubbles.forEach((bubble) => bubble.update(deltaTime));

    // Apply buoyancy
    this.bubbles.forEach((bubble) => {
      bubble.applyForce(0, -0.0008 * bubble.area);
    });

    // Apply fan effects
    if (this.fans) {
      this.bubbles.forEach((bubble) => {
        const breeze =
          bubble.x < this.canvas.width * 0.3
            ? 0.00002
            : bubble.x > this.canvas.width * 0.7
              ? -0.00002
              : 0;
        if (breeze) bubble.applyForce(breeze, 0);
      });
    }

    // Check collisions and update score
    this.updateScore();

    // Clean up off-screen bubbles
    this.bubbles = this.bubbles.filter(
      (bubble) => bubble.y > -bubble.radius && bubble.y < this.canvas.height + bubble.radius,
    );
  }

  private updateScore() {
    // Simple scoring: points for being near bubbles
    let afloatBonus = 0;
    this.bubbles.forEach((bubble) => {
      const distance = Math.sqrt(
        Math.pow(this.ragdoll.x - bubble.x, 2) + Math.pow(this.ragdoll.y - bubble.y, 2),
      );
      if (distance < bubble.radius + 30) {
        afloatBonus += 0.1;
      }
    });
    this.score += afloatBonus;
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

    // Draw bubbles
    this.bubbles.forEach((bubble) => bubble.render(this.ctx));

    // Draw ragdoll
    this.ragdoll.render(this.ctx, this.skin);

    // Draw fan indicators
    if (this.fans) {
      this.drawFanIndicators();
    }
  }

  private drawFanIndicators() {
    this.ctx.save();
    this.ctx.globalAlpha = 0.3;

    // Left fan
    this.ctx.fillStyle = 'rgba(135, 206, 250, 0.5)';
    this.ctx.fillRect(0, 0, 100, this.canvas.height);

    // Right fan
    this.ctx.fillRect(this.canvas.width - 100, 0, 100, this.canvas.height);

    this.ctx.restore();
  }

  spawnBubble() {
    if (this.bubbles.length < 20) {
      const types: ('normal' | 'sticky' | 'explosive' | 'gigantic')[] = [
        'normal',
        'normal',
        'normal',
        'sticky',
        'explosive',
        'gigantic',
      ];
      const type = types[Math.floor(Math.random() * types.length)];

      this.bubbles.push(
        new Bubble(
          Math.random() * this.canvas.width,
          this.canvas.height - 20,
          Math.random() * 20 + 16,
          type,
        ),
      );
    }
  }

  spawnBubbleType(type: 'normal' | 'sticky' | 'explosive' | 'gigantic') {
    if (this.bubbles.length < 20) {
      this.bubbles.push(
        new Bubble(
          Math.random() * this.canvas.width,
          this.canvas.height - 20,
          Math.random() * 20 + 16,
          type,
        ),
      );
    }
  }

  toggleFans() {
    this.fans = !this.fans;
  }

  reset() {
    this.score = 0;
    this.gameTime = 0;
    this.ragdoll.reset(this.canvas.width / 2, 60);
    this.bubbles = [];
    this.spawnInitialBubbles();
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

  getTime(): number {
    return this.gameTime;
  }
}

// Enhanced Bubble class with types
class Bubble {
  x: number;
  y: number;
  radius: number;
  vx: number = 0;
  vy: number = 0;
  area: number;
  type: 'normal' | 'sticky' | 'explosive' | 'gigantic';
  stickyTimer: number = 0;
  explosiveTimer: number = 0;
  id: string;

  constructor(
    x: number,
    y: number,
    radius: number,
    type: 'normal' | 'sticky' | 'explosive' | 'gigantic' = 'normal',
  ) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.type = type;
    this.area = Math.PI * radius * radius;
    this.id = Math.random().toString(36).substr(2, 9);

    // Adjust properties based on type
    switch (type) {
      case 'sticky':
        this.radius = Math.max(12, radius * 0.8);
        break;
      case 'explosive':
        this.radius = Math.max(8, radius * 0.6);
        break;
      case 'gigantic':
        this.radius = radius * 2;
        break;
    }
    this.area = Math.PI * this.radius * this.radius;
  }

  update(deltaTime: number) {
    this.x += this.vx;
    this.y += this.vy;

    // Type-specific behavior
    switch (this.type) {
      case 'sticky':
        this.stickyTimer -= deltaTime;
        if (this.stickyTimer > 0) {
          this.vx *= 0.95; // Slower movement when sticky
          this.vy *= 0.95;
        }
        break;
      case 'explosive':
        this.explosiveTimer -= deltaTime;
        if (this.explosiveTimer <= 0) {
          this.explode();
        }
        break;
      case 'gigantic':
        // Gigantic bubbles have more buoyancy
        this.vy -= 0.0005;
        break;
    }

    // Add some random movement
    this.vx += (Math.random() - 0.5) * 0.0001;
    this.vy += (Math.random() - 0.5) * 0.0001;

    // Damping
    this.vx *= 0.99;
    this.vy *= 0.99;
  }

  applyForce(fx: number, fy: number) {
    this.vx += fx;
    this.vy += fy;
  }

  makeSticky(duration: number = 2) {
    this.stickyTimer = duration;
  }

  makeExplosive(duration: number = 5) {
    this.explosiveTimer = duration;
  }

  explode() {
    // Create explosion effect (simplified)
    this.radius = 0; // Mark for removal
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = 0.85;

    // Bubble colors based on type
    let fillColor: string;
    let strokeColor: string;

    switch (this.type) {
      case 'normal':
        fillColor = 'rgba(240, 248, 255, 0.35)';
        strokeColor = 'rgba(255, 255, 255, 0.6)';
        break;
      case 'sticky':
        fillColor = 'rgba(255, 165, 0, 0.4)';
        strokeColor = 'rgba(255, 140, 0, 0.8)';
        break;
      case 'explosive':
        fillColor = 'rgba(255, 0, 0, 0.4)';
        strokeColor = 'rgba(255, 100, 100, 0.8)';
        break;
      case 'gigantic':
        fillColor = 'rgba(138, 43, 226, 0.4)';
        strokeColor = 'rgba(138, 43, 226, 0.8)';
        break;
    }

    // Bubble body
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Bubble border
    ctx.lineWidth = 2;
    ctx.strokeStyle = strokeColor;
    ctx.stroke();

    // Type indicators
    if (this.type === 'sticky' && this.stickyTimer > 0) {
      ctx.fillStyle = 'rgba(255, 140, 0, 0.8)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.type === 'explosive' && this.explosiveTimer > 0) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x - 5, this.y);
      ctx.lineTo(this.x + 5, this.y);
      ctx.moveTo(this.x, this.y - 5);
      ctx.lineTo(this.x, this.y + 5);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// Ragdoll class (simplified)
class Ragdoll {
  x: number;
  y: number;
  private segments: RagdollSegment[] = [];
  private baseX: number;
  private baseY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.createSegments();
  }

  private createSegments() {
    // Create simple ragdoll segments
    this.segments = [
      new RagdollSegment(this.x, this.y - 48, 18, 18, 'head'), // head
      new RagdollSegment(this.x, this.y, 36, 60, 'torso'), // torso
      new RagdollSegment(this.x, this.y + 40, 28, 20, 'hip'), // hip
      new RagdollSegment(this.x - 32, this.y - 10, 12, 34, 'arm'), // left arm
      new RagdollSegment(this.x + 32, this.y - 10, 12, 34, 'arm'), // right arm
      new RagdollSegment(this.x - 12, this.y + 65, 14, 38, 'leg'), // left leg
      new RagdollSegment(this.x + 12, this.y + 65, 14, 38, 'leg'), // right leg
    ];
  }

  update(deltaTime: number) {
    // Simple physics simulation
    this.segments.forEach((segment) => {
      segment.update(deltaTime);
    });

    // Update center position
    this.x = this.segments.reduce((sum, seg) => sum + seg.x, 0) / this.segments.length;
    this.y = this.segments.reduce((sum, seg) => sum + seg.y, 0) / this.segments.length;
  }

  render(ctx: CanvasRenderingContext2D, skin: string) {
    this.segments.forEach((segment) => {
      segment.render(ctx, skin);
    });
  }

  reset(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.segments.forEach((segment, index) => {
      segment.reset(x, y, index);
    });
  }
}

// Ragdoll segment class
class RagdollSegment {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
  private baseX: number;
  private baseY: number;
  private vx: number = 0;
  private vy: number = 0;

  constructor(x: number, y: number, width: number, height: number, type: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
    this.baseX = x;
    this.baseY = y;
  }

  update(_deltaTime: number) {
    // Simple gravity
    this.vy += 0.001;

    // Update position
    this.x += this.vx;
    this.y += this.vy;

    // Damping
    this.vx *= 0.98;
    this.vy *= 0.98;
  }

  render(ctx: CanvasRenderingContext2D, skin: string) {
    ctx.save();

    // Apply skin colors
    const colors = this.getSkinColors(skin);

    // Draw segment
    ctx.fillStyle = colors.fill;
    ctx.strokeStyle = colors.stroke;
    ctx.lineWidth = 1;

    if (this.type === 'head') {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
      ctx.strokeRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }

    ctx.restore();
  }

  private getSkinColors(skin: string) {
    const isMale = skin.includes('male');

    switch (skin) {
      case 'gym':
        return {
          fill: isMale ? '#8B4513' : '#FFB6C1',
          stroke: isMale ? '#654321' : '#FF69B4',
        };
      case 'festival':
        return {
          fill: isMale ? '#FFD700' : '#FF69B4',
          stroke: isMale ? '#B8860B' : '#FF1493',
        };
      case 'chibi':
        return {
          fill: isMale ? '#87CEEB' : '#FFC0CB',
          stroke: isMale ? '#4682B4' : '#FFB6C1',
        };
      case 'armor':
        return {
          fill: isMale ? '#C0C0C0' : '#F0E68C',
          stroke: isMale ? '#808080' : '#DAA520',
        };
      default:
        return {
          fill: isMale ? '#87CEEB' : '#FFB6C1',
          stroke: isMale ? '#4682B4' : '#FF69B4',
        };
    }
  }

  reset(baseX: number, baseY: number, index: number) {
    this.x = baseX + (index - 3) * 10;
    this.y = baseY + (index - 3) * 15;
    this.baseX = this.x;
    this.baseY = this.y;
    this.vx = 0;
    this.vy = 0;
  }
}
