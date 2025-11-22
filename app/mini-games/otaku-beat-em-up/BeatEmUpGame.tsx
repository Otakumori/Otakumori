'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameControls, { CONTROL_PRESETS } from '@/components/GameControls';
import {
  useScreenShake,
  createPetalBurst,
  updatePetalParticles,
  type PetalParticle,
} from '../_shared/vfx';
import { PhysicsCharacterRenderer } from '../_shared/PhysicsCharacterRenderer';
import { createGlowEffect } from '../_shared/enhancedTextures';

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
  state: 'idle' | 'walk' | 'attack' | 'heavyAttack' | 'hurt' | 'block';
  animationFrame: number;
  attackCooldown: number;
  heavyAttackCooldown: number;
  blockCooldown: number;
  invulnerable: number;
  comboCount: number;
  beatMultiplier: number;
  comboChain: number; // Chain of successful hits
}

interface Enemy {
  id: string;
  type: 'grunt' | 'brute' | 'ninja' | 'boss';
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 'left' | 'right';
  state: 'idle' | 'walk' | 'attack' | 'telegraph' | 'hurt' | 'dead';
  health: number;
  maxHealth: number;
  attackCooldown: number;
  stunTime: number;
  animationFrame: number;
  telegraphTime: number; // Time remaining in telegraph state
  attackType: 'light' | 'heavy'; // Type of attack being telegraphed
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
  onGameEnd?: (score: number, didWin: boolean) => void;
}

export default function BeatEmUpGame({
  mode,
  onScoreChange,
  onHealthChange,
  onComboChange,
  onGameEnd,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const beatIntervalRef = useRef<number | null>(null);
  const gameLoopRef = useRef<number | null>(null);

  // Physics renderers
  const playerRendererRef = useRef<PhysicsCharacterRenderer | null>(null);
  const enemyRenderersRef = useRef<Map<string, PhysicsCharacterRenderer>>(new Map());

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
    heavyAttackCooldown: 0,
    blockCooldown: 0,
    invulnerable: 0,
    comboCount: 0,
    beatMultiplier: 1.0,
    comboChain: 0,
  });

  // VFX hooks
  const { shake } = useScreenShake();
  const [petalParticles, setPetalParticles] = useState<PetalParticle[]>([]);

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

  // Initialize physics renderers
  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Initialize player renderer
    if (!playerRendererRef.current) {
      playerRendererRef.current = new PhysicsCharacterRenderer(ctx, 'player', {
        quality: 'high',
        enabled: true,
      });
    }

    return () => {
      // Cleanup on unmount
      if (playerRendererRef.current) {
        playerRendererRef.current.dispose();
        playerRendererRef.current = null;
      }
      enemyRenderersRef.current.forEach((renderer) => renderer.dispose());
      enemyRenderersRef.current.clear();
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

      // Light attack on spacebar
      if (e.key === ' ' && playerRef.current.attackCooldown <= 0) {
        performAttack('light');
        e.preventDefault();
      }

      // Heavy attack on E key
      if ((e.key === 'e' || e.key === 'E') && playerRef.current.heavyAttackCooldown <= 0) {
        performAttack('heavy');
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
  const performAttack = useCallback(
    (attackType: 'light' | 'heavy' = 'light') => {
      const player = playerRef.current;

      if (attackType === 'heavy' && player.heavyAttackCooldown > 0) {
        return; // Heavy attack on cooldown
      }

      player.state = attackType === 'heavy' ? 'heavyAttack' : 'attack';
      player.attackCooldown = attackType === 'heavy' ? 800 : 400;
      if (attackType === 'heavy') {
        player.heavyAttackCooldown = 2000; // 2 second cooldown for heavy attacks
      }

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
      const attackRange = attackType === 'heavy' ? 120 : 80;
      const attackX = player.facing === 'right' ? player.x + 50 : player.x - 50;
      const baseDamage = attackType === 'heavy' ? 40 : 20;
      const damage = baseDamage * damageMultiplier;

      let hitEnemy = false;
      enemiesRef.current = enemiesRef.current.map((enemy) => {
        if (enemy.state === 'dead') return enemy;

        const distance = Math.hypot(enemy.x - attackX, enemy.y - player.y);
        if (distance < attackRange) {
          hitEnemy = true;
          const newHealth = Math.max(0, enemy.health - damage);

          // Apply physics impact
          const renderer = enemyRenderersRef.current.get(enemy.id);
          if (renderer) {
            const impactForce = {
              x:
                player.facing === 'right'
                  ? attackType === 'heavy'
                    ? 5
                    : 3
                  : attackType === 'heavy'
                    ? -5
                    : -3,
              y: -2,
            };
            renderer.applyImpact(impactForce, 'chest');
          }

          // Apply physics impact to player (recoil)
          if (playerRendererRef.current) {
            const recoilForce = {
              x: player.facing === 'right' ? -1 : 1,
              y: 0,
            };
            playerRendererRef.current.applyImpact(recoilForce, 'chest');
          }

          // Screen shake on heavy hits or when enemy dies
          if (attackType === 'heavy' || newHealth <= 0) {
            shake(attackType === 'heavy' ? 0.4 : 0.3, attackType === 'heavy' ? 300 : 200);
          }

          // Create petal burst on hit
          const burst = createPetalBurst(enemy.x, enemy.y, attackType === 'heavy' ? 12 : 6, {
            speed: attackType === 'heavy' ? 3 : 2,
            spread: Math.PI * 1.5,
          });
          setPetalParticles((prev) => [...prev, ...burst]);

          // Update combo chain
          player.comboChain++;
          const comboBonus = Math.min(player.comboChain * 5, 50); // Max 50 bonus per hit

          setGameState((prev) => ({
            ...prev,
            score: prev.score + Math.floor(damage * 10) + comboBonus,
            combo: player.comboCount,
            multiplier: player.beatMultiplier,
            beatAccuracy: isPerfectBeat
              ? 100
              : prev.beatAccuracy * 0.95 + (isPerfectBeat ? 100 : 70) * 0.05,
          }));

          // Cleanup physics renderer if enemy dies
          if (newHealth <= 0) {
            const renderer = enemyRenderersRef.current.get(enemy.id);
            if (renderer) {
              renderer.dispose();
              enemyRenderersRef.current.delete(enemy.id);
            }
          }

          return {
            ...enemy,
            health: newHealth,
            state: newHealth <= 0 ? 'dead' : 'hurt',
            stunTime: attackType === 'heavy' ? 600 : 300,
            vx:
              player.facing === 'right'
                ? attackType === 'heavy'
                  ? 10
                  : 5
                : attackType === 'heavy'
                  ? -10
                  : -5,
          };
        }
        return enemy;
      });

      // Reset combo chain if no enemy hit
      if (!hitEnemy) {
        player.comboChain = 0;
      }

      // Reset attack state after animation
      setTimeout(
        () => {
          if (player.state === 'attack' || player.state === 'heavyAttack') {
            player.state = 'idle';
          }
        },
        attackType === 'heavy' ? 600 : 400,
      );
    },
    [shake],
  );

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
      telegraphTime: 0,
      attackType: 'light',
    };

    // Create physics renderer for new enemy
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        const renderer = new PhysicsCharacterRenderer(
          ctx,
          'default', // Use default preset for enemies
          { quality: 'high', enabled: true },
        );
        enemyRenderersRef.current.set(newEnemy.id, renderer);
      }
    }

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

      // Update player physics
      if (playerRendererRef.current) {
        playerRendererRef.current.update(
          deltaTime,
          { x: player.vx, y: player.vy },
          { x: player.x, y: player.y },
        );
      }

      // Update cooldowns
      if (player.attackCooldown > 0) player.attackCooldown -= deltaTime * 1000;
      if (player.heavyAttackCooldown > 0) player.heavyAttackCooldown -= deltaTime * 1000;
      if (player.blockCooldown > 0) player.blockCooldown -= deltaTime * 1000;
      if (player.invulnerable > 0) player.invulnerable -= deltaTime * 1000;

      // Decay combo chain if no hits for 2 seconds
      if (Date.now() - (lastBeatTimeRef.current || Date.now()) > 2000) {
        player.comboChain = Math.max(0, player.comboChain - 1);
      }

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

          // Enemy attack logic with telegraphs
          if (enemy.telegraphTime > 0) {
            // In telegraph state - countdown to attack
            enemy.telegraphTime -= deltaTime * 1000;
            if (enemy.telegraphTime <= 0) {
              // Execute attack
              enemy.state = 'attack';

              // Deal damage to player if not blocking
              if (player.state !== 'block' && player.invulnerable <= 0) {
                const damage =
                  enemy.attackType === 'heavy'
                    ? enemy.type === 'brute'
                      ? 25
                      : enemy.type === 'boss'
                        ? 30
                        : 15
                    : enemy.type === 'brute'
                      ? 15
                      : enemy.type === 'ninja'
                        ? 10
                        : 8;

                // Apply physics impact to player
                if (playerRendererRef.current) {
                  const impactForce = {
                    x: enemy.facing === 'right' ? 3 : -3,
                    y: -1,
                  };
                  playerRendererRef.current.applyImpact(impactForce, 'chest');
                }

                setGameState((prev) => ({
                  ...prev,
                  health: Math.max(0, prev.health - damage),
                  combo: 0,
                  multiplier: 1.0,
                }));
                player.invulnerable = 500;
                player.comboCount = 0;
                player.comboChain = 0;

                // Screen shake on heavy enemy attacks
                if (enemy.attackType === 'heavy') {
                  shake(0.3, 250);
                }
              }

              setTimeout(
                () => {
                  if (enemy.state === 'attack') {
                    enemy.state = 'idle';
                  }
                },
                enemy.attackType === 'heavy' ? 600 : 400,
              );
            }
          } else if (enemy.attackCooldown <= 0) {
            // Start telegraph - warn player before attack
            const shouldHeavyAttack =
              enemy.type === 'brute' || enemy.type === 'boss' || Math.random() < 0.3;
            enemy.state = 'telegraph';
            enemy.attackType = shouldHeavyAttack ? 'heavy' : 'light';
            enemy.telegraphTime = shouldHeavyAttack ? 800 : 400; // Longer telegraph for heavy attacks
            enemy.attackCooldown =
              enemy.type === 'ninja' ? 800 : enemy.type === 'brute' ? 1500 : 1000;
          } else {
            enemy.state = 'idle';
            enemy.attackCooldown -= deltaTime * 1000;
          }
        }

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        // Update enemy physics
        const renderer = enemyRenderersRef.current.get(enemy.id);
        if (renderer) {
          renderer.update(deltaTime, { x: enemy.vx, y: enemy.vy }, { x: enemy.x, y: enemy.y });
        }

        // Clamp enemy to arena
        enemy.x = Math.max(30, Math.min(CANVAS_WIDTH - 30, enemy.x));
        enemy.y = Math.max(GROUND_Y - 100, Math.min(GROUND_Y + 100, enemy.y));

        enemy.animationFrame += deltaTime * 8;

        return true;
      });

      // Wave progression - advance when all enemies defeated
      const aliveEnemies = enemiesRef.current.filter((e) => e.state !== 'dead');
      if (aliveEnemies.length === 0 && enemySpawnTimer > 1000) {
        // Wave cleared! Advance to next wave
        setGameState((prev) => ({
          ...prev,
          wave: prev.wave + 1,
        }));
        enemySpawnTimer = 0;

        // Spawn wave enemies (more enemies per wave)
        const waveEnemyCount = Math.min(3 + gameState.wave, 8);
        const waveTypes: Enemy['type'][] = [];

        // Mix enemy types based on wave
        for (let i = 0; i < waveEnemyCount; i++) {
          if (gameState.wave % 5 === 0 && i === waveEnemyCount - 1) {
            waveTypes.push('boss'); // Boss every 5 waves
          } else if (gameState.wave % 3 === 0 && Math.random() < 0.3) {
            waveTypes.push('brute');
          } else if (Math.random() < 0.4) {
            waveTypes.push('ninja');
          } else {
            waveTypes.push('grunt');
          }
        }

        // Spawn enemies with slight delay
        waveTypes.forEach((type, index) => {
          setTimeout(() => {
            spawnEnemy(type);
          }, index * 300);
        });
      }

      // Spawn enemies during wave
      enemySpawnTimer += deltaTime * 1000;
      const maxEnemiesPerWave = Math.min(3 + gameState.wave, mode === 'survival' ? 10 : 8);
      const spawnInterval =
        mode === 'survival' ? 2000 : ENEMY_SPAWN_INTERVAL / (1 + gameState.wave * 0.1); // Faster spawning as waves progress

      if (enemySpawnTimer > spawnInterval && aliveEnemies.length < maxEnemiesPerWave) {
        const types: Enemy['type'][] =
          gameState.wave >= 5
            ? ['grunt', 'grunt', 'ninja', 'brute', 'brute']
            : gameState.wave >= 3
              ? ['grunt', 'grunt', 'ninja', 'brute']
              : ['grunt', 'grunt', 'ninja'];
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
        // Notify parent of game over
        if (onGameEnd) {
          onGameEnd(gameState.score, false); // didWin = false (health reached 0)
        }
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

    // Draw background gradient - Enhanced
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#1a0520');
    bgGradient.addColorStop(0.5, '#2e0b1a');
    bgGradient.addColorStop(1, '#0f0718');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Enhanced background overlay with glow
    const overlayGradient = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      0,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      Math.max(CANVAS_WIDTH, CANVAS_HEIGHT),
    );
    overlayGradient.addColorStop(0, 'rgba(139, 92, 246, 0.1)');
    overlayGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = overlayGradient;
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

    // Render entities in depth order with physics
    allEntities.forEach((entity) => {
      if (entity.type === 'player') {
        const player = playerRef.current;
        if (playerRendererRef.current) {
          // Use physics renderer
          playerRendererRef.current.render(player.x, player.y, player.facing);

          // Draw attack effect overlay
          if (player.state === 'attack' || player.state === 'heavyAttack') {
            const attackX = player.facing === 'right' ? player.x + 40 : player.x - 40;
            const isHeavy = player.state === 'heavyAttack';
            const radius = isHeavy ? 40 : 25;

            createGlowEffect(
              ctx,
              attackX,
              player.y - 10,
              radius,
              isHeavy ? '#ff6464' : '#ffffff',
              isHeavy ? 0.6 : 0.4,
            );
          }

          // Draw block shield overlay
          if (player.state === 'block') {
            ctx.save();
            ctx.strokeStyle = '#60a5fa';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#60a5fa';
            ctx.beginPath();
            ctx.arc(player.x, player.y - 10, 35, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }
        } else {
          // Fallback to original rendering
          renderPlayer(ctx, player);
        }
      } else if (entity.type === 'enemy' && entity.enemy) {
        const enemy = entity.enemy;
        const renderer = enemyRenderersRef.current.get(enemy.id);
        if (renderer) {
          // Use physics renderer
          renderer.render(enemy.x, enemy.y, enemy.facing);

          // Draw health bar
          const healthBarWidth = 40;
          const healthPercent = enemy.health / enemy.maxHealth;
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(enemy.x - healthBarWidth / 2, enemy.y - 50, healthBarWidth, 4);
          ctx.fillStyle =
            healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#ef4444';
          ctx.fillRect(
            enemy.x - healthBarWidth / 2,
            enemy.y - 50,
            healthBarWidth * healthPercent,
            4,
          );

          // Telegraph warning
          if (enemy.state === 'telegraph') {
            const telegraphProgress =
              1 - enemy.telegraphTime / (enemy.attackType === 'heavy' ? 800 : 400);
            const pulse = Math.sin(telegraphProgress * Math.PI * 4) * 0.3 + 0.7;
            ctx.save();
            ctx.globalAlpha = pulse;
            ctx.strokeStyle = enemy.attackType === 'heavy' ? '#ff4444' : '#ffaa44';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = enemy.attackType === 'heavy' ? '#ff4444' : '#ffaa44';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y - 20, 30, 0, Math.PI * 2);
            ctx.stroke();
            if (enemy.attackType === 'heavy') {
              ctx.fillStyle = '#ff4444';
              ctx.font = 'bold 16px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('!', enemy.x, enemy.y - 15);
            }
            ctx.restore();
          }
        } else {
          // Fallback to original rendering
          renderEnemy(ctx, enemy);
        }
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

    // Draw petal particles
    if (petalParticles.length > 0) {
      petalParticles.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 4 * particle.scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
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
    if (player.state === 'attack' || player.state === 'heavyAttack') {
      const attackX = player.facing === 'right' ? player.x + 40 : player.x - 40;
      const isHeavy = player.state === 'heavyAttack';
      const radius = isHeavy ? 40 : 25;

      // Heavy attack has larger, more intense effect
      ctx.fillStyle = isHeavy
        ? 'rgba(255, 100, 100, 0.8)'
        : player.beatMultiplier > 1.5
          ? 'rgba(255, 215, 0, 0.6)'
          : 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = isHeavy ? 30 : 15;
      ctx.shadowColor = isHeavy ? '#ff6464' : '#ffffff';
      ctx.beginPath();
      ctx.arc(attackX, player.y - 10, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
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

    // Telegraph warning - visual indicator before attack
    if (enemy.state === 'telegraph') {
      const telegraphProgress =
        1 - enemy.telegraphTime / (enemy.attackType === 'heavy' ? 800 : 400);
      const pulse = Math.sin(telegraphProgress * Math.PI * 4) * 0.3 + 0.7;

      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.strokeStyle = enemy.attackType === 'heavy' ? '#ff4444' : '#ffaa44';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = enemy.attackType === 'heavy' ? '#ff4444' : '#ffaa44';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y - size * 0.3, size * 0.8, 0, Math.PI * 2);
      ctx.stroke();

      // Exclamation mark for heavy attacks
      if (enemy.attackType === 'heavy') {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('!', enemy.x, enemy.y - size * 0.2);
      }
      ctx.restore();
    }

    ctx.restore();
  };

  // Update petal particles
  useEffect(() => {
    if (petalParticles.length === 0) return;

    let animationId: number | null = null;
    let lastTime = performance.now();
    let isRunning = true;

    const updateParticles = () => {
      if (!isRunning) return;

      const now = performance.now();
      const deltaTime = Math.min(0.033, (now - lastTime) / 1000);
      lastTime = now;

      setPetalParticles((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        const updated = updatePetalParticles(prev, deltaTime, 0.1);
        if (updated.length > 0 && isRunning) {
          animationId = requestAnimationFrame(updateParticles);
        }
        return updated;
      });
    };

    animationId = requestAnimationFrame(updateParticles);

    return () => {
      isRunning = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [petalParticles.length]);

  // Render petal particles
  useEffect(() => {
    if (!canvasRef.current || petalParticles.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Particles are rendered in the main render loop, but we need to ensure they're visible
    // The render function will handle drawing them
  }, [petalParticles.length]);

  return (
    <div className="relative">
      {/* Keyboard Controls Display */}
      <GameControls
        game="Rhythm Beat-Em-Up"
        controls={[
          ...CONTROL_PRESETS['petal-samurai'],
          { key: 'WASD / Arrows', action: 'Move' },
          { key: 'Space', action: 'Light Attack (on-beat for bonus!)' },
          { key: 'E', action: 'Heavy Attack (2s cooldown)' },
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

        <div className="bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-white/20">
          <div className="text-xs text-blue-300 mb-1">WAVE</div>
          <div className="text-lg font-bold text-blue-400">{gameState.wave}</div>
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
