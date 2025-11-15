'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameControls, { CONTROL_PRESETS } from '@/components/GameControls';

type GameMode = 'story' | 'arcade' | 'survival';

interface GameState {
  score: number;
  combo: number;
  multiplier: number;
  health: number;
  maxHealth: number;
  wave: number;
  isGameOver: boolean;
  isPaused: boolean;
  beatAccuracy: number; // 0-100%
}

interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walk' | 'attack' | 'hurt' | 'block';
  animationFrame: number;
  attackCooldown: number;
  blockCooldown: number;
  invulnerable: number;
  comboCount: number;
  beatMultiplier: number;
}

interface Enemy {
  id: string;
  type: 'grunt' | 'brute' | 'ninja' | 'boss';
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walk' | 'attack' | 'hurt' | 'dead';
  health: number;
  maxHealth: number;
  attackCooldown: number;
  stunTime: number;
  animationFrame: number;
}

interface BeatIndicator {
  id: number;
  x: number;
  opacity: number;
  size: number;
  perfect: boolean;
}

interface Props {
  mode: GameMode;
  onScoreChange?: (score: number) => void;
  onHealthChange?: (health: number) => void;
  onComboChange?: (combo: number) => void;
}

export default function BeatEmUpGame({ mode, onScoreChange, onHealthChange, onComboChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const beatIntervalRef = useRef<number | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    multiplier: 1.0,
    health: 100,
    maxHealth: 100,
    wave: 1,
    isGameOver: false,
    isPaused: false,
    beatAccuracy: 100,
  });

  const playerRef = useRef<Player>({
    x: 200,
    y: 300,
    vx: 0,
    vy: 0,
    facing: 'right',
    state: 'idle',
    animationFrame: 0,
    attackCooldown: 0,
    blockCooldown: 0,
    invulnerable: 0,
    comboCount: 0,
    beatMultiplier: 1.0,
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const keysRef = useRef<Set<string>>(new Set());
  const lastBeatTimeRef = useRef<number>(0);
  const beatIndicatorsRef = useRef<BeatIndicator[]>([]);
  const beatCounterRef = useRef<number>(0);

  // Notify parent of state changes
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(gameState.score);
    }
  }, [gameState.score, onScoreChange]);

  useEffect(() => {
    if (onHealthChange) {
      onHealthChange(gameState.health);
    }
  }, [gameState.health, onHealthChange]);

  useEffect(() => {
    if (onComboChange) {
      onComboChange(gameState.combo);
    }
  }, [gameState.combo, onComboChange]);

  // BPM and rhythm settings
  const BPM = 128; // Beats per minute
  const BEAT_INTERVAL = 60000 / BPM; // ms per beat
  const PERFECT_BEAT_WINDOW = 100; // ms tolerance for perfect beat
  const GOOD_BEAT_WINDOW = 200; // ms tolerance for good beat

  // Game dimensions
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const GROUND_Y = 400;
  const PLAYER_SPEED = 4;
  const ENEMY_SPAWN_INTERVAL = 3000; // 3 seconds

  // Initialize audio context for beat tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Beat pulse system
  useEffect(() => {
    if (gameState.isGameOver || gameState.isPaused) return;

    const interval = setInterval(() => {
      lastBeatTimeRef.current = Date.now();
      beatCounterRef.current++;

      // Create beat indicator
      beatIndicatorsRef.current.push({
        id: beatCounterRef.current,
        x: CANVAS_WIDTH - 100,
        opacity: 1.0,
        size: 20,
        perfect: false,
      });

      // Play beat sound (simple beep)
      if (audioContextRef.current) {
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.frequency.value = beatCounterRef.current % 4 === 0 ? 880 : 440;
        gain.gain.value = 0.1;
        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.05);
      }
    }, BEAT_INTERVAL);

    beatIntervalRef.current = interval as unknown as number;

    return () => {
      if (beatIntervalRef.current) {
        clearInterval(beatIntervalRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.isPaused]);

  // Keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());

      // Attack on spacebar
      if (e.key === ' ' && playerRef.current.attackCooldown <= 0) {
        performAttack();
        e.preventDefault();
      }

      // Block on shift
      if (e.key === 'shift' && playerRef.current.blockCooldown <= 0) {
        playerRef.current.state = 'block';
        playerRef.current.blockCooldown = 500;
      }

      // Pause on escape
      if (e.key === 'escape') {
        setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());

      if (e.key === 'shift') {
        if (playerRef.current.state === 'block') {
          playerRef.current.state = 'idle';
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Perform player attack
  const performAttack = useCallback(() => {
    const player = playerRef.current;
    player.state = 'attack';
    player.attackCooldown = 400;

    // Check if attack is on-beat
    const timeSinceLastBeat = Date.now() - lastBeatTimeRef.current;
    const beatOffset = Math.min(timeSinceLastBeat, BEAT_INTERVAL - timeSinceLastBeat);

    let damageMultiplier = 1.0;
    let isPerfectBeat = false;

    if (beatOffset < PERFECT_BEAT_WINDOW) {
      // Perfect timing!
      damageMultiplier = 2.0;
      player.beatMultiplier = 2.0;
      player.comboCount++;
      isPerfectBeat = true;

      // Visual feedback
      beatIndicatorsRef.current = beatIndicatorsRef.current.map((ind) =>
        ind.id === beatCounterRef.current ? { ...ind, perfect: true, size: 40 } : ind,
      );
    } else if (beatOffset < GOOD_BEAT_WINDOW) {
      // Good timing
      damageMultiplier = 1.5;
      player.beatMultiplier = 1.5;
      player.comboCount++;
    } else {
      // Off-beat
      damageMultiplier = 0.7;
      player.beatMultiplier = 0.7;
      player.comboCount = 0; // Reset combo
    }

    // Check for enemy hits
    const attackRange = 80;
    const attackX = player.facing === 'right' ? player.x + 50 : player.x - 50;

    enemiesRef.current = enemiesRef.current.map((enemy) => {
      if (enemy.state === 'dead') return enemy;

      const distance = Math.hypot(enemy.x - attackX, enemy.y - player.y);
      if (distance < attackRange) {
        const damage = 20 * damageMultiplier;
        const newHealth = Math.max(0, enemy.health - damage);

        setGameState((prev) => ({
          ...prev,
          score: prev.score + Math.floor(damage * 10),
          combo: player.comboCount,
          multiplier: player.beatMultiplier,
          beatAccuracy: isPerfectBeat
            ? 100
            : prev.beatAccuracy * 0.95 + (isPerfectBeat ? 100 : 70) * 0.05,
        }));

        return {
          ...enemy,
          health: newHealth,
          state: newHealth <= 0 ? 'dead' : 'hurt',
          stunTime: 300,
          vx: player.facing === 'right' ? 5 : -5,
        };
      }
      return enemy;
    });

    // Reset attack state after animation
    setTimeout(() => {
      if (player.state === 'attack') {
        player.state = 'idle';
      }
    }, 400);
  }, []);

  // Spawn enemies
  const spawnEnemy = useCallback((type: Enemy['type'] = 'grunt') => {
    const spawnX = Math.random() > 0.5 ? CANVAS_WIDTH + 50 : -50;
    const spawnY = GROUND_Y + Math.random() * 100 - 50;

    const healthMap: Record<Enemy['type'], number> = {
      grunt: 50,
      brute: 100,
      ninja: 40,
      boss: 300,
    };

    const newEnemy: Enemy = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: spawnX,
      y: spawnY,
      vx: spawnX > CANVAS_WIDTH / 2 ? -1.5 : 1.5,
      vy: 0,
      facing: spawnX > CANVAS_WIDTH / 2 ? 'left' : 'right',
      state: 'walk',
      health: healthMap[type],
      maxHealth: healthMap[type],
      attackCooldown: 1000,
      stunTime: 0,
      animationFrame: 0,
    };

    enemiesRef.current.push(newEnemy);
  }, []);

  // Game update loop
  useEffect(() => {
    if (!canvasRef.current || gameState.isGameOver || gameState.isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = Date.now();
    let enemySpawnTimer = 0;

    const gameLoop = () => {
      const now = Date.now();
      const deltaTime = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      // Update player
      const player = playerRef.current;
      player.vx = 0;
      player.vy = 0;

      if (player.state !== 'attack' && player.state !== 'block') {
        if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) {
          player.vx = -PLAYER_SPEED;
          player.facing = 'left';
          player.state = 'walk';
        } else if (keysRef.current.has('d') || keysRef.current.has('arrowright')) {
          player.vx = PLAYER_SPEED;
          player.facing = 'right';
          player.state = 'walk';
        }

        if (keysRef.current.has('w') || keysRef.current.has('arrowup')) {
          player.vy = -PLAYER_SPEED;
          player.state = 'walk';
        } else if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) {
          player.vy = PLAYER_SPEED;
          player.state = 'walk';
        }

        if (player.vx === 0 && player.vy === 0 && player.state === 'walk') {
          player.state = 'idle';
        }
      }

      player.x += player.vx;
      player.y += player.vy;

      // Clamp player to arena
      player.x = Math.max(30, Math.min(CANVAS_WIDTH - 30, player.x));
      player.y = Math.max(GROUND_Y - 100, Math.min(GROUND_Y + 100, player.y));

      // Update cooldowns
      if (player.attackCooldown > 0) player.attackCooldown -= deltaTime * 1000;
      if (player.blockCooldown > 0) player.blockCooldown -= deltaTime * 1000;
      if (player.invulnerable > 0) player.invulnerable -= deltaTime * 1000;

      // Update enemies
      enemiesRef.current = enemiesRef.current.filter((enemy) => {
        if (enemy.state === 'dead') {
          enemy.animationFrame += deltaTime * 5;
          return enemy.animationFrame < 2; // Remove after death animation
        }

        if (enemy.stunTime > 0) {
          enemy.stunTime -= deltaTime * 1000;
          enemy.x += enemy.vx;
          enemy.vx *= 0.9;
          return true;
        }

        // Enemy AI - move towards player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 60) {
          enemy.state = 'walk';
          enemy.vx =
            (dx / distance) * (enemy.type === 'ninja' ? 2.5 : enemy.type === 'brute' ? 1.0 : 1.5);
          enemy.vy =
            (dy / distance) * (enemy.type === 'ninja' ? 2.5 : enemy.type === 'brute' ? 1.0 : 1.5);
          enemy.facing = dx > 0 ? 'right' : 'left';
        } else {
          enemy.vx = 0;
          enemy.vy = 0;

          // Attack player
          if (enemy.attackCooldown <= 0) {
            enemy.state = 'attack';
            enemy.attackCooldown =
              enemy.type === 'ninja' ? 800 : enemy.type === 'brute' ? 1500 : 1000;

            // Deal damage to player if not blocking
            if (player.state !== 'block' && player.invulnerable <= 0) {
              const damage = enemy.type === 'brute' ? 15 : enemy.type === 'ninja' ? 10 : 8;
              setGameState((prev) => ({
                ...prev,
                health: Math.max(0, prev.health - damage),
                combo: 0,
                multiplier: 1.0,
              }));
              player.invulnerable = 500;
              player.comboCount = 0;
            }

            setTimeout(() => {
              if (enemy.state === 'attack') {
                enemy.state = 'idle';
              }
            }, 400);
          } else {
            enemy.state = 'idle';
            enemy.attackCooldown -= deltaTime * 1000;
          }
        }

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Clamp enemy to arena
        enemy.x = Math.max(30, Math.min(CANVAS_WIDTH - 30, enemy.x));
        enemy.y = Math.max(GROUND_Y - 100, Math.min(GROUND_Y + 100, enemy.y));

        enemy.animationFrame += deltaTime * 8;

        return true;
      });

      // Spawn enemies
      enemySpawnTimer += deltaTime * 1000;
      const spawnInterval = mode === 'survival' ? 2000 : ENEMY_SPAWN_INTERVAL;
      if (
        enemySpawnTimer > spawnInterval &&
        enemiesRef.current.length < (mode === 'survival' ? 10 : 5)
      ) {
        const types: Enemy['type'][] = ['grunt', 'grunt', 'ninja', 'brute'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        spawnEnemy(randomType);
        enemySpawnTimer = 0;
      }

      // Update beat indicators
      beatIndicatorsRef.current = beatIndicatorsRef.current
        .map((ind) => ({
          ...ind,
          x: ind.x - deltaTime * 200,
          opacity: ind.opacity - deltaTime * 2,
        }))
        .filter((ind) => ind.opacity > 0);

      // Render
      render(ctx);

      // Check game over
      if (gameState.health <= 0) {
        setGameState((prev) => ({ ...prev, isGameOver: true }));
        return;
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.isGameOver, gameState.isPaused, mode, spawnEnemy]);

  // Render function
  const render = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#1a0520');
    bgGradient.addColorStop(0.5, '#2e0b1a');
    bgGradient.addColorStop(1, '#0f0718');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw ground line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    // Depth sorting
    const allEntities = [
      { type: 'player' as const, y: playerRef.current.y },
      ...enemiesRef.current.map((e) => ({ type: 'enemy' as const, y: e.y, enemy: e })),
    ].sort((a, b) => a.y - b.y);

    // Render entities in depth order
    allEntities.forEach((entity) => {
      if (entity.type === 'player') {
        renderPlayer(ctx, playerRef.current);
      } else if (entity.type === 'enemy' && entity.enemy) {
        renderEnemy(ctx, entity.enemy);
      }
    });

    // Render beat indicators
    beatIndicatorsRef.current.forEach((ind) => {
      ctx.save();
      ctx.globalAlpha = ind.opacity;
      ctx.fillStyle = ind.perfect ? '#FFD700' : '#ec4899';
      ctx.shadowBlur = ind.perfect ? 20 : 10;
      ctx.shadowColor = ind.perfect ? '#FFD700' : '#ec4899';
      ctx.beginPath();
      ctx.arc(ind.x, 30, ind.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Render beat track (top bar)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(CANVAS_WIDTH - 120, 10, 100, 40);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.strokeRect(CANVAS_WIDTH - 120, 10, 100, 40);

    // Beat perfect zone
    ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
    ctx.fillRect(CANVAS_WIDTH - 120, 10, 40, 40);
  };

  // Render player
  const renderPlayer = (ctx: CanvasRenderingContext2D, player: Player) => {
    ctx.save();

    // Shadow
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(player.x, GROUND_Y + 10, 30, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Invulnerability flash
    if (player.invulnerable > 0) {
      ctx.globalAlpha = Math.sin(Date.now() / 50) * 0.5 + 0.5;
    }

    // Body
    const bodyGradient = ctx.createLinearGradient(
      player.x - 20,
      player.y - 40,
      player.x + 20,
      player.y + 20,
    );
    bodyGradient.addColorStop(0, '#4ade80');
    bodyGradient.addColorStop(1, '#22c55e');
    ctx.fillStyle = bodyGradient;
    ctx.fillRect(player.x - 20, player.y - 30, 40, 50);

    // Head
    ctx.fillStyle = '#ffc7d9';
    ctx.beginPath();
    ctx.arc(player.x, player.y - 40, 15, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#000000';
    const eyeOffsetX = player.facing === 'right' ? 5 : -5;
    ctx.beginPath();
    ctx.arc(player.x + eyeOffsetX - 5, player.y - 42, 3, 0, Math.PI * 2);
    ctx.arc(player.x + eyeOffsetX + 5, player.y - 42, 3, 0, Math.PI * 2);
    ctx.fill();

    // Attack effect
    if (player.state === 'attack') {
      const attackX = player.facing === 'right' ? player.x + 40 : player.x - 40;
      ctx.fillStyle =
        player.beatMultiplier > 1.5 ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.arc(attackX, player.y - 10, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Block shield
    if (player.state === 'block') {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#60a5fa';
      ctx.beginPath();
      ctx.arc(player.x, player.y - 10, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  };

  // Render enemy
  const renderEnemy = (ctx: CanvasRenderingContext2D, enemy: Enemy) => {
    if (enemy.state === 'dead') {
      ctx.globalAlpha = 1 - enemy.animationFrame / 2;
    }

    ctx.save();

    // Shadow
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(enemy.x, GROUND_Y + 10, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Color based on type
    let color = '#ec4899';
    if (enemy.type === 'brute') color = '#ef4444';
    if (enemy.type === 'ninja') color = '#8b5cf6';
    if (enemy.type === 'boss') color = '#dc2626';

    // Body
    const size = enemy.type === 'brute' ? 50 : enemy.type === 'boss' ? 60 : 40;
    ctx.fillStyle = color;
    ctx.fillRect(enemy.x - size / 2, enemy.y - size * 0.6, size, size);

    // Head
    ctx.fillStyle = '#ff9fbe';
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y - size * 0.7, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Health bar
    const healthBarWidth = 40;
    const healthPercent = enemy.health / enemy.maxHealth;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(enemy.x - healthBarWidth / 2, enemy.y - size - 10, healthBarWidth, 4);
    ctx.fillStyle = healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
    ctx.fillRect(
      enemy.x - healthBarWidth / 2,
      enemy.y - size - 10,
      healthBarWidth * healthPercent,
      4,
    );

    ctx.restore();
  };

  return (
    <div className="relative">
      {/* Keyboard Controls Display */}
      <GameControls
        game="Rhythm Beat-Em-Up"
        controls={[
          ...CONTROL_PRESETS['petal-samurai'],
          { key: 'WASD / Arrows', action: 'Move' },
          { key: 'Space', action: 'Attack (on-beat for bonus!)' },
          { key: 'Shift', action: 'Block' },
          { key: 'Esc', action: 'Pause' },
        ]}
        position="bottom-left"
        autoHideDelay={10000}
      />

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-auto rounded-2xl border border-pink-500/20 shadow-2xl bg-black"
        aria-label="Rhythm Beat-Em-Up game area"
      />

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 space-y-2">
        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-white/20">
          <div className="text-xs text-pink-300 mb-1">HEALTH</div>
          <div className="w-48 h-4 bg-black/50 rounded-full overflow-hidden border border-red-500/30">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all duration-300"
              style={{ width: `${(gameState.health / gameState.maxHealth) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-white/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-pink-300">SCORE</div>
              <div className="text-lg font-bold">{gameState.score}</div>
            </div>
            <div>
              <div className="text-xs text-yellow-300">COMBO</div>
              <div className="text-lg font-bold text-yellow-400">{gameState.combo}x</div>
            </div>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-white/20">
          <div className="text-xs text-purple-300 mb-1">BEAT ACCURACY</div>
          <div className="text-lg font-bold text-purple-400">
            {gameState.beatAccuracy.toFixed(0)}%
          </div>
          <div className="text-xs text-zinc-400">
            Multiplier: {gameState.multiplier.toFixed(1)}x
          </div>
        </div>
      </div>

      {/* Pause Screen */}
      {gameState.isPaused && (
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-4">PAUSED</h2>
            <p className="text-zinc-300">Press ESC to resume</p>
          </div>
        </motion.div>
      )}

      {/* Game Over Screen */}
      {gameState.isGameOver && (
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-center max-w-md mx-4">
            <h2 className="text-3xl font-bold text-white mb-4">GAME OVER</h2>
            <div className="space-y-2 mb-6 text-zinc-200">
              <p>
                Final Score: <span className="text-yellow-400 font-bold">{gameState.score}</span>
              </p>
              <p>
                Best Combo: <span className="text-pink-400 font-bold">{gameState.combo}x</span>
              </p>
              <p>
                Beat Accuracy:{' '}
                <span className="text-purple-400 font-bold">
                  {gameState.beatAccuracy.toFixed(0)}%
                </span>
              </p>
              <p className="text-sm text-pink-300 italic mt-4">
                "I didn't lose. Just ran out of health." – Edward Elric
              </p>
            </div>
            <motion.button
              className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition-colors"
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
