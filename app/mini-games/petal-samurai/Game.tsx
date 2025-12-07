/**
 * Petal Samurai - Fruit Ninja-style Slicing Game
 *
 * Core Fantasy: Slice falling petals with precision - chain combos for petals.
 *
 * Game Flow: instructions → playing → results
 * Win Condition: Survive time limit or reach target score
 * Lose Condition: Miss 3 petals or time runs out
 *
 * Progression: Speed increases every 20 seconds, storm mode after 60 seconds
 * Scoring: Base points per petal, combo multipliers, gold petals worth more
 * Petals: Awarded based on final score, combo, and accuracy
 */

'use client';

import { logger } from '@/app/lib/logger';
import { newRequestId } from '@/app/lib/requestId';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import GameControls, { CONTROL_PRESETS } from '@/components/GameControls';
import { GameOverlay } from '../_shared/GameOverlay';
import { useGameHud } from '../_shared/useGameHud';
import { useGameProgress } from '@/app/lib/games/progress';
import { getGameVisualProfile, applyVisualProfile } from '../_shared/gameVisuals';
import { usePetalBalance } from '@/app/hooks/usePetalBalance';
import {
  useScreenShake,
  createPetalBurst,
  updatePetalParticles,
  type PetalParticle,
  createTrailRenderer,
  type TrailRenderer,
} from '../_shared/vfx';
import { PhysicsCharacterRenderer } from '../_shared/PhysicsCharacterRenderer';
import { createGlowEffect } from '../_shared/enhancedTextures';
import Character3D, { type Character3DRef } from './Character3D';

type Props = {
  mode: 'classic' | 'storm' | 'endless' | 'timed';
  difficulty?: 'easy' | 'normal' | 'hard';
};

// Game configuration - difficulty tuning parameters
const GAME_CONFIG = {
  MAX_MISSES: 3,
  TIME_LIMIT: 60, // seconds
  SPEED_RAMP_INTERVAL: 20, // seconds between speed increases
  SPEED_RAMP_AMOUNT: 0.3, // speed multiplier increase per ramp
  STORM_MODE_TIME: 60, // seconds until storm mode
  STORM_SPAWN_RATE: 0.3, // seconds between petal spawns in storm mode
  NORMAL_SPAWN_RATE: 0.8, // seconds between petal spawns normally
  POWER_UP_SPAWN_INTERVAL: 15, // seconds between power-up spawn chances
  POWER_UP_SPAWN_CHANCE: 0.1, // probability of spawning power-up
  COMBO_MULTIPLIER_BASE: 1.0,
  COMBO_MULTIPLIER_INCREMENT: 0.2,
  MAX_MULTIPLIER: 5.0,
  NORMAL_PETAL_POINTS: 1,
  GOLD_PETAL_POINTS: 5,
  RARE_PETAL_POINTS: 10, // Special colored petals
  BAD_OBJECT_PENALTY: 3, // Score penalty for slicing bad objects
  BAD_OBJECT_PETAL_PENALTY: 1, // Petal penalty for slicing bad objects
  STUN_DURATION: 0.5, // seconds
  BAD_OBJECT_SPAWN_CHANCE: 0.15, // 15% chance to spawn bad object instead of petal
  SPRITE_SHEET_URL: '/assets/images/petal_sprite.png',
  SPRITE_GRID_COLS: 4,
  SPRITE_GRID_ROWS: 3,
  SPRITE_COUNT: 12, // 4x3 grid
} as const;

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
  type: 'normal' | 'gold' | 'rare' | 'bad'; // bad = nut/seed/branch
  speed: number;
  size: number;
  rotation: number;
  fallSpeed: number;
  spriteIndex: number; // Index in 4x3 sprite grid (0-11)
  vx: number; // Horizontal drift velocity
  vy: number; // Vertical velocity
}

interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'slow_time' | 'combo_boost' | 'miss_forgive';
  duration: number;
  active: boolean;
}

export default function Game({ mode, difficulty = 'normal' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    multiplier: 1,
    misses: 0,
    timeLeft: mode === 'endless' ? 999 : GAME_CONFIG.TIME_LIMIT,
    isRunning: true,
    isGameOver: false,
    isStunned: false,
    stormMode: false,
  });
  const [petalReward, setPetalReward] = useState<number | null>(null);
  const [hasAwardedPetals, setHasAwardedPetals] = useState(false);
  const [gameStateOverlay, setGameStateOverlay] = useState<
    'instructions' | 'playing' | 'win' | 'lose'
  >('instructions');

  // VFX hooks
  const { shake, shakeOffset, style: shakeStyle } = useScreenShake();
  const [petalParticles, setPetalParticles] = useState<PetalParticle[]>([]);

  // Visual profile and HUD
  const visualProfile = getGameVisualProfile('petal-samurai');
  const { backgroundStyle } = applyVisualProfile(visualProfile);
  const { Component: HudComponent, isQuakeHud, props: hudProps } = useGameHud('petal-samurai');
  const { balance: petalBalance } = usePetalBalance();
  const { recordResult } = useGameProgress();

  // Initialize game engine with visual profile
  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    const game = new GameEngine(canvas, mode, visualProfile, difficulty);
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
        const isGameOver =
          game.getMisses() >= GAME_CONFIG.MAX_MISSES ||
          (mode !== 'endless' && game.getTime() >= GAME_CONFIG.TIME_LIMIT);
        if (isGameOver && gameState.isRunning) {
          const didWin =
            game.getMisses() < GAME_CONFIG.MAX_MISSES &&
            (mode === 'endless' || game.getTime() < GAME_CONFIG.TIME_LIMIT);
          setGameState((prev) => ({ ...prev, isRunning: false, isGameOver: true }));
          setGameStateOverlay(didWin ? 'win' : 'lose');
          game.endGame();

          // Award petals on game end
          if (!hasAwardedPetals) {
            setHasAwardedPetals(true);
            const awardPetals = async () => {
              const result = await recordResult({
                gameId: 'petal-samurai',
                score: game.getScore(),
                difficulty: difficulty || 'normal',
                durationMs: Math.floor(game.getTime() * 1000),
                didWin,
                metadata: {
                  combo: game.getCombo(),
                  multiplier: game.getMultiplier(),
                  misses: game.getMisses(),
                  mode,
                  stormMode: game.isStormMode(),
                },
              });

              if (result.success && result.petalReward) {
                setPetalReward(result.petalReward.earned);
              }
            };
            awardPetals();
          }
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
  }, [mode, difficulty, recordResult]);

  // Handle mouse/touch slash mechanics
  const slashPoints = useRef<{ x: number; y: number; time: number }[]>([]);
  const isSlashing = useRef(false);
  const trailRendererRef = useRef<TrailRenderer | null>(null);

  // Initialize trail renderer
  useEffect(() => {
    trailRendererRef.current = createTrailRenderer(200); // 200ms lifetime
  }, []);

  const handleMouseDown = useCallback(
    (_event: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameState.isStunned) return;
      isSlashing.current = true;
      slashPoints.current = [];
    },
    [gameState.isStunned],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
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
        const wasBad = petal.type === 'bad';
        gameRef.current!.slashPetal(petal);

        // Create petal burst particles on slice
        if (!wasBad && trailRendererRef.current) {
          const burst = createPetalBurst(petal.x, petal.y, 6, {
            speed: 2,
            spread: Math.PI * 1.5,
          });
          setPetalParticles((prev) => [...prev, ...burst]);

          // Add trail point
          trailRendererRef.current.addPoint(petal.x, petal.y, 4);
        } else if (wasBad) {
          // Screen shake on bad object hit
          shake(0.4, 300);
        }
      });

      // Update trail renderer with current slash points
      if (trailRendererRef.current && slashPoints.current.length > 0) {
        const lastPoint = slashPoints.current[slashPoints.current.length - 1];
        trailRendererRef.current.addPoint(lastPoint.x, lastPoint.y, 3);
      }

      // Draw slash trail
      gameRef.current.setSlashTrail(slashPoints.current);
    },
    [shake],
  );

  const handleMouseUp = useCallback(() => {
    isSlashing.current = false;
    slashPoints.current = [];
    if (gameRef.current) {
      gameRef.current.clearSlashTrail();
    }
    if (trailRendererRef.current) {
      trailRendererRef.current.clear();
    }
  }, []);

  // Update petal particles
  useEffect(() => {
    if (gameStateOverlay !== 'playing') {
      setPetalParticles([]); // Clear particles when not playing
      return;
    }

    let animationId: number | null = null;
    let lastTime = performance.now();
    let isRunning = true;

    const updateParticles = () => {
      if (!isRunning) return;

      const now = performance.now();
      const deltaTime = Math.min(0.033, (now - lastTime) / 1000); // Cap at 33ms
      lastTime = now;

      setPetalParticles((prev) => {
        if (prev.length === 0) {
          return prev;
        }
        const updated = updatePetalParticles(prev, deltaTime, 0.15);
        if (updated.length > 0 && isRunning) {
          animationId = requestAnimationFrame(updateParticles);
        }
        return updated;
      });
    };

    // Start animation loop
    animationId = requestAnimationFrame(updateParticles);

    return () => {
      isRunning = false;
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameStateOverlay]);

  // Handle power-up activation
  const handlePowerUpClick = useCallback((powerUpType: string) => {
    if (gameRef.current) {
      gameRef.current.activatePowerUp(powerUpType);
    }
  }, []);

  // Submit score to leaderboard when game ends
  useEffect(() => {
    if (gameState.isGameOver && gameRef.current) {
      const submitScore = async () => {
        try {
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
                stormMode: gameState.stormMode,
              },
            }),
          });
        } catch (error) {
          logger.error('Failed to submit score:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
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
    gameState.stormMode,
    mode,
  ]);

  const handleStart = useCallback(() => {
    setGameStateOverlay('playing');
    setGameState((prev) => ({ ...prev, isRunning: true }));
    // Start the game engine
    if (gameRef.current) {
      gameRef.current.startGame();
    }
  }, []);

  const handleRestart = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div className="relative w-full h-screen" style={{ ...backgroundStyle, ...shakeStyle }}>
      {/* Keyboard Controls Display */}
      <GameControls
        game="Petal Samurai"
        controls={[...CONTROL_PRESETS['petal-samurai']]}
        position="bottom-left"
        autoHideDelay={8000}
      />

      {/* Game Canvas Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="max-w-4xl w-full">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-auto cursor-crosshair rounded-2xl border-2 border-pink-500/30 shadow-2xl bg-black/20"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            aria-label="Petal Samurai game area - slash through petals to score"
          />
        </div>
      </div>

      {/* Render petal particles */}
      {gameStateOverlay === 'playing' && petalParticles.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none z-10"
          width={800}
          height={600}
          style={{ transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)` }}
        >
          {petalParticles.map((particle) => {
            if (!visualProfile.spriteSheetUrl) return null;

            const spriteCol = particle.spriteIndex % 4;
            const spriteRow = Math.floor(particle.spriteIndex / 4);
            const spriteSize = 32; // Assuming sprite size

            return (
              <g
                key={particle.id}
                transform={`translate(${particle.x}, ${particle.y}) rotate(${(particle.rotation * 180) / Math.PI}) scale(${particle.scale})`}
                opacity={particle.alpha}
              >
                <image
                  href={visualProfile.spriteSheetUrl}
                  x={-spriteSize / 2}
                  y={-spriteSize / 2}
                  width={spriteSize}
                  height={spriteSize}
                  clipPath={`inset(${spriteRow * spriteSize}px ${(3 - spriteCol) * spriteSize}px ${(2 - spriteRow) * spriteSize}px ${spriteCol * spriteSize}px)`}
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* HUD - uses loader for cosmetics */}
      {gameStateOverlay === 'playing' && (
        <>
          {isQuakeHud ? (
            <HudComponent {...hudProps} petals={petalBalance} gameId="petal-samurai" />
          ) : (
            <HudComponent
              {...hudProps}
              score={gameState.score}
              combo={gameState.combo}
              multiplier={gameState.multiplier}
              lives={GAME_CONFIG.MAX_MISSES - gameState.misses}
              timeLeft={mode !== 'endless' ? gameState.timeLeft : undefined}
              message={gameState.stormMode ? 'STORM MODE!' : undefined}
            />
          )}
        </>
      )}

      {/* Power-ups */}
      {gameStateOverlay === 'playing' && (
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
      )}

      {/* Stun Effect */}
      {gameState.isStunned && gameStateOverlay === 'playing' && (
        <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="text-2xl font-bold text-red-500 animate-pulse">STUNNED!</div>
        </div>
      )}

      {/* Game Overlay */}
      <GameOverlay
        state={gameStateOverlay}
        instructions={
          [
            'Drag/swipe to slice falling petals',
            'Chain slices for combo multipliers',
            `Avoid missing ${GAME_CONFIG.MAX_MISSES} petals`,
            mode !== 'endless' && `Survive ${GAME_CONFIG.TIME_LIMIT} seconds`,
            'Gold petals are worth more points',
            'Rare petals grant bonus combos',
            'Avoid bad objects (nuts/seeds) - they break combos!',
          ].filter(Boolean) as string[]
        }
        winMessage="Excellent slicing! You've mastered the way of the Petal Samurai!"
        loseMessage={
          gameState.misses >= GAME_CONFIG.MAX_MISSES ? 'Too many petals missed!' : "Time's up!"
        }
        score={gameState.score}
        petalReward={petalReward}
        onRestart={handleRestart}
        onResume={handleStart}
      />
    </div>
  );
}

// Enhanced Game Engine Class
class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mode: string;
  private visualProfile: ReturnType<typeof getGameVisualProfile>;
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
  private spriteSheet: HTMLImageElement | null = null;
  private spriteSheetLoaded: boolean = false;
  private physicsRenderer: PhysicsCharacterRenderer | null = null;
  private isGameStarted: boolean = false;
  private difficulty: 'easy' | 'normal' | 'hard' = 'normal';

  constructor(
    canvas: HTMLCanvasElement,
    mode: string,
    visualProfile: ReturnType<typeof getGameVisualProfile>,
    difficulty: 'easy' | 'normal' | 'hard' = 'normal',
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.mode = mode;
    this.visualProfile = visualProfile;
    this.difficulty = difficulty;

    // Initialize physics renderer
    this.physicsRenderer = new PhysicsCharacterRenderer(this.ctx, 'player', {
      quality: 'high',
      enabled: true,
    });

    // Load sprite sheet from visual profile
    this.loadSpriteSheet();

    this.startGameLoop();
  }

  private loadSpriteSheet() {
    const img = new Image();
    // Use sprite sheet from visual profile if available, otherwise fallback
    const spriteUrl =
      this.visualProfile.petals?.spritePath ||
      this.visualProfile.spriteSheetUrl ||
      GAME_CONFIG.SPRITE_SHEET_URL;
    img.src = spriteUrl;
    img.onload = () => {
      this.spriteSheet = img;
      this.spriteSheetLoaded = true;
    };
    img.onerror = () => {
      logger.warn('Failed to load petal sprite sheet, falling back to canvas drawing');
      this.spriteSheetLoaded = false;
    };
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
    // Don't update game logic until game is started
    if (!this.isGameStarted) {
      this.render(); // Still render background
      return;
    }

    this.gameTime += deltaTime;

    // Update stun timer
    if (this.stunTime > 0) {
      this.stunTime -= deltaTime;
      return;
    }

    // Speed scaling - ramps up every 20 seconds
    this.baseSpeed =
      1.0 +
      Math.floor(this.gameTime / GAME_CONFIG.SPEED_RAMP_INTERVAL) * GAME_CONFIG.SPEED_RAMP_AMOUNT;

    // Storm mode after 60 seconds
    if (this.gameTime >= GAME_CONFIG.STORM_MODE_TIME && !this.stormMode) {
      this.stormMode = true;
    }

    // Spawn petals with difficulty-based spawn rates
    let spawnRate = this.stormMode ? GAME_CONFIG.STORM_SPAWN_RATE : GAME_CONFIG.NORMAL_SPAWN_RATE;

    // Apply difficulty multiplier
    const difficultyMultiplier =
      this.difficulty === 'easy' ? 1.5 : this.difficulty === 'hard' ? 0.6 : 1.0;
    spawnRate *= difficultyMultiplier;

    // Difficulty curve: slower spawn at start
    if (this.gameTime < 20) {
      spawnRate *= 1.5; // Slower at start
    } else if (this.gameTime < 40) {
      spawnRate *= 1.2; // Gradually increase
    }

    if (this.gameTime - this.lastPetalSpawn > spawnRate) {
      this.spawnPetal();
      this.lastPetalSpawn = this.gameTime;
    }

    // Spawn power-ups occasionally
    if (
      this.gameTime - this.lastPowerUpSpawn > GAME_CONFIG.POWER_UP_SPAWN_INTERVAL &&
      Math.random() < GAME_CONFIG.POWER_UP_SPAWN_CHANCE
    ) {
      this.spawnPowerUp();
      this.lastPowerUpSpawn = this.gameTime;
    }

    // Update petals with physics (curved arcs, gravity, air drag)
    this.petals.forEach((petal) => {
      // Apply gravity
      petal.vy += 0.3 * deltaTime * 60; // Gravity acceleration

      // Apply air drag (horizontal drift)
      petal.vx *= 0.98; // Slight horizontal drift decay
      petal.vy *= 0.99; // Vertical drag

      // Update position
      petal.x += petal.vx * this.baseSpeed;
      petal.y += petal.vy * this.baseSpeed;

      // Rotation based on movement
      petal.rotation += petal.vx * 0.05 + 0.1;
    });

    // Remove off-screen petals and count as misses (only if game started)
    this.petals = this.petals.filter((petal) => {
      if (petal.y > this.canvas.height || petal.x < -50 || petal.x > this.canvas.width + 50) {
        if (petal.type !== 'bad' && this.isGameStarted) {
          // Only count misses for petals, not bad objects, and only after game starts
          this.misses++;
          this.combo = 0;
          this.multiplier = GAME_CONFIG.COMBO_MULTIPLIER_BASE;
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

    // Update physics renderer
    if (this.physicsRenderer) {
      const centerX = this.canvas.width / 2;
      const baseY = this.canvas.height - 80;
      const slashPose = this.slashTrail.length > 0;
      // Calculate velocity based on slash state
      const velocityX = slashPose
        ? this.slashTrail.length > 1
          ? (this.slashTrail[this.slashTrail.length - 1].x -
              this.slashTrail[this.slashTrail.length - 2].x) *
            10
          : 0
        : 0;
      const velocityY = slashPose ? -1 : 0; // Slight upward motion during slash
      this.physicsRenderer.update(
        deltaTime,
        { x: velocityX, y: velocityY },
        { x: centerX, y: baseY },
      );
    }
  }

  private spawnPetal() {
    // Difficulty curve: bad objects only appear after 30 seconds
    const canSpawnBadObjects = this.gameTime >= 30;
    const badObjectChance = canSpawnBadObjects ? GAME_CONFIG.BAD_OBJECT_SPAWN_CHANCE : 0;

    // Determine if spawning bad object or petal
    const isBadObject = Math.random() < badObjectChance;

    if (isBadObject) {
      // Spawn bad object (nut/seed/branch)
      const badObject: Petal = {
        id: Math.random().toString(36).substr(2, 9),
        x: Math.random() * (this.canvas.width - 40) + 20,
        y: -20,
        type: 'bad',
        speed: 1,
        size: 16,
        rotation: 0,
        fallSpeed: 1.0,
        spriteIndex: 11, // Use last sprite slot for bad objects (or draw custom)
        vx: (Math.random() - 0.5) * 0.5, // Random horizontal drift
        vy: 1.2 + Math.random() * 0.3, // Slightly faster fall
      };
      this.petals.push(badObject);
      return;
    }

    // Spawn petal (normal/gold/rare)
    const rand = Math.random();
    let type: 'normal' | 'gold' | 'rare';
    if (rand < 0.7) {
      type = 'normal';
    } else if (rand < 0.95) {
      type = 'gold';
    } else {
      type = 'rare'; // 5% chance for rare petals
    }

    // Random sprite index from 0-10 (save 11 for bad objects)
    const spriteIndex = Math.floor(Math.random() * (GAME_CONFIG.SPRITE_COUNT - 1));

    const petal: Petal = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (this.canvas.width - 40) + 20,
      y: -20,
      type,
      speed: 1,
      size: type === 'gold' ? 25 : type === 'rare' ? 28 : 20,
      rotation: 0,
      fallSpeed: type === 'gold' ? 1.5 : type === 'rare' ? 1.3 : 1.0 + Math.random() * 0.4,
      spriteIndex,
      vx: (Math.random() - 0.5) * 0.3, // Slight horizontal drift for curved arcs
      vy: 0.8 + Math.random() * 0.4, // Initial vertical velocity
    };

    this.petals.push(petal);
  }

  private spawnPowerUp() {
    const types: ('slow_time' | 'combo_boost' | 'miss_forgive')[] = [
      'slow_time',
      'combo_boost',
      'miss_forgive',
    ];
    const type = types[Math.floor(Math.random() * types.length)] ?? 'slow_time';

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

    // Apply physics impact based on petal type
    if (this.physicsRenderer) {
      const impactForce =
        petal.type === 'bad'
          ? { x: 0, y: 3 } // Bad objects cause recoil
          : petal.type === 'rare'
            ? { x: (Math.random() - 0.5) * 2, y: -4 } // Rare petals cause stronger upward impact
            : { x: (Math.random() - 0.5) * 1.5, y: -2 }; // Normal petals cause slight upward impact
      const impactPart = petal.type === 'bad' ? 'chest' : 'chest'; // Impact on chest for all types
      this.physicsRenderer.applyImpact(impactForce, impactPart);
    }

    if (petal.type === 'bad') {
      // Bad objects cause penalty
      this.score = Math.max(0, this.score - GAME_CONFIG.BAD_OBJECT_PENALTY);
      this.combo = 0;
      this.multiplier = GAME_CONFIG.COMBO_MULTIPLIER_BASE;
      this.stunTime = GAME_CONFIG.STUN_DURATION;
    } else {
      // Award points based on petal type
      let points: number = GAME_CONFIG.NORMAL_PETAL_POINTS;
      if (petal.type === 'gold') {
        points = GAME_CONFIG.GOLD_PETAL_POINTS;
      } else if (petal.type === 'rare') {
        points = GAME_CONFIG.RARE_PETAL_POINTS;
      }

      this.score += Math.floor(points * this.multiplier);
      this.combo++;
      this.multiplier = Math.min(
        GAME_CONFIG.MAX_MULTIPLIER,
        GAME_CONFIG.COMBO_MULTIPLIER_BASE +
          (this.combo - 1) * GAME_CONFIG.COMBO_MULTIPLIER_INCREMENT,
      );

      if (petal.type === 'gold' || petal.type === 'rare') {
        this.combo += petal.type === 'rare' ? 3 : 2; // Rare petals give even more combo
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
        this.multiplier = Math.min(
          GAME_CONFIG.MAX_MULTIPLIER,
          GAME_CONFIG.COMBO_MULTIPLIER_BASE +
            (this.combo - 1) * GAME_CONFIG.COMBO_MULTIPLIER_INCREMENT,
        );
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

    // Draw background using visual profile colors
    const bg = this.visualProfile.background;
    const accentColor = bg.accentColor || '#ec4899';

    // Create gradient based on visual profile
    const bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);

    // Use dojo-style background for petal-samurai
    if (bg.kind === 'dojo') {
      bgGradient.addColorStop(0, '#0a0a0a'); // Deep black
      bgGradient.addColorStop(0.3, '#1a0d2e'); // Deep purple-black
      bgGradient.addColorStop(0.5, '#2e0b1a'); // Dark sakura pink
      bgGradient.addColorStop(0.7, '#1a0d2e'); // Deep purple-black
      bgGradient.addColorStop(1, '#0a0a0a'); // Near black
    } else {
      // Fallback to visual profile backgroundColor if it's a gradient string
      // Parse gradient or use solid color
      const bgColor = this.visualProfile.backgroundColor || '#0a0a0a';
      if (bgColor.includes('gradient')) {
        // Simple gradient parsing (basic support)
        bgGradient.addColorStop(0, accentColor);
        bgGradient.addColorStop(1, '#0a0a0a');
      } else {
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        return; // Skip gradient if solid color
      }
    }

    this.ctx.fillStyle = bgGradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Add rim lighting effect for dojo
    if (bg.kind === 'dojo') {
      const rimGradient = this.ctx.createRadialGradient(
        this.canvas.width / 2,
        this.canvas.height,
        0,
        this.canvas.width / 2,
        this.canvas.height,
        this.canvas.height * 0.8,
      );
      rimGradient.addColorStop(0, `${accentColor}20`);
      rimGradient.addColorStop(1, 'transparent');
      this.ctx.fillStyle = rimGradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Atmospheric particles (ambient petals)
    this.renderAtmosphericPetals();

    // Character rendering disabled - focusing on petal slicing mechanics
    // this.renderSamuraiCharacter();

    // Draw petals using sprite sheet
    this.petals.forEach((petal) => {
      this.ctx.save();
      this.ctx.translate(petal.x, petal.y);
      this.ctx.rotate(petal.rotation);

      if (this.spriteSheetLoaded && this.spriteSheet && petal.type !== 'bad') {
        // Draw from sprite sheet (4x3 grid)
        const spriteCol = petal.spriteIndex % GAME_CONFIG.SPRITE_GRID_COLS;
        const spriteRow = Math.floor(petal.spriteIndex / GAME_CONFIG.SPRITE_GRID_COLS);
        const spriteWidth = this.spriteSheet.width / GAME_CONFIG.SPRITE_GRID_COLS;
        const spriteHeight = this.spriteSheet.height / GAME_CONFIG.SPRITE_GRID_ROWS;

        const sx = spriteCol * spriteWidth;
        const sy = spriteRow * spriteHeight;

        // Apply tint based on petal type using visual profile colors
        const accentColor = this.visualProfile.background.accentColor || '#ec4899';
        const glowColor = this.visualProfile.background.glowColor || '#a78bfa';

        if (petal.type === 'gold') {
          this.ctx.globalCompositeOperation = 'multiply';
          // Use glow color for gold petals
          const goldTint = this.hexToRgba(glowColor, 0.4);
          this.ctx.fillStyle = goldTint;
          this.ctx.fillRect(-petal.size, -petal.size, petal.size * 2, petal.size * 2);
          this.ctx.globalCompositeOperation = 'source-over';
        } else if (petal.type === 'rare') {
          this.ctx.globalCompositeOperation = 'multiply';
          // Use accent color for rare petals
          const rareTint = this.hexToRgba(accentColor, 0.5);
          this.ctx.fillStyle = rareTint;
          this.ctx.fillRect(-petal.size, -petal.size, petal.size * 2, petal.size * 2);
          this.ctx.globalCompositeOperation = 'source-over';
        }

        // Draw sprite with enhanced rendering
        // Add glow effect for special petals
        if (petal.type === 'gold' || petal.type === 'rare') {
          this.ctx.shadowBlur = 15;
          this.ctx.shadowColor =
            petal.type === 'gold'
              ? this.hexToRgba(glowColor, 0.8)
              : this.hexToRgba(accentColor, 0.8);
        }

        // Draw sprite with proper scaling
        this.ctx.drawImage(
          this.spriteSheet,
          sx,
          sy,
          spriteWidth,
          spriteHeight,
          -petal.size,
          -petal.size * 0.6,
          petal.size * 2,
          petal.size * 1.2,
        );

        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
      } else if (petal.type === 'bad') {
        // Draw bad object (nut/seed/branch) - enhanced with texture-like appearance
        // Create gradient for depth
        const badGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, petal.size * 0.8);
        badGradient.addColorStop(0, '#A0522D'); // Saddle brown center
        badGradient.addColorStop(0.5, '#8B4513'); // Brown
        badGradient.addColorStop(1, '#654321'); // Dark brown edge

        this.ctx.fillStyle = badGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, petal.size * 0.8, petal.size * 0.5, petal.rotation, 0, Math.PI * 2);
        this.ctx.fill();

        // Add texture-like detail
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Add highlight for 3D effect
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.beginPath();
        this.ctx.ellipse(
          -petal.size * 0.2,
          -petal.size * 0.15,
          petal.size * 0.3,
          petal.size * 0.2,
          petal.rotation,
          0,
          Math.PI * 2,
        );
        this.ctx.fill();
      } else {
        // Fallback: draw simple petal shape if sprite not loaded, using visual profile colors
        const accentColor = this.visualProfile.background.accentColor || '#ec4899';
        const glowColor = this.visualProfile.background.glowColor || '#a78bfa';

        if (petal.type === 'gold') {
          this.ctx.fillStyle = this.hexToRgba(glowColor, 1.0);
        } else if (petal.type === 'rare') {
          this.ctx.fillStyle = this.hexToRgba(accentColor, 1.0);
        } else {
          this.ctx.fillStyle = this.hexToRgba(accentColor, 0.9);
        }

        // Enhanced fallback petal with gradient and glow
        const petalGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, petal.size);
        if (petal.type === 'gold') {
          petalGradient.addColorStop(0, this.hexToRgba(glowColor, 1.0));
          petalGradient.addColorStop(0.7, this.hexToRgba(glowColor, 0.8));
          petalGradient.addColorStop(1, this.hexToRgba(glowColor, 0.6));
        } else if (petal.type === 'rare') {
          petalGradient.addColorStop(0, this.hexToRgba(accentColor, 1.0));
          petalGradient.addColorStop(0.7, this.hexToRgba(accentColor, 0.8));
          petalGradient.addColorStop(1, this.hexToRgba(accentColor, 0.6));
        } else {
          petalGradient.addColorStop(0, this.hexToRgba(accentColor, 0.95));
          petalGradient.addColorStop(0.7, this.hexToRgba(accentColor, 0.8));
          petalGradient.addColorStop(1, this.hexToRgba(accentColor, 0.6));
        }

        // Add glow for special petals
        if (petal.type === 'gold' || petal.type === 'rare') {
          this.ctx.shadowBlur = 12;
          this.ctx.shadowColor =
            petal.type === 'gold'
              ? this.hexToRgba(glowColor, 0.6)
              : this.hexToRgba(accentColor, 0.6);
        }

        this.ctx.fillStyle = petalGradient;
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Enhanced stroke with gradient
        const strokeGradient = this.ctx.createLinearGradient(-petal.size, 0, petal.size, 0);
        strokeGradient.addColorStop(0, this.hexToRgba(accentColor, 0.6));
        strokeGradient.addColorStop(0.5, this.hexToRgba(accentColor, 1.0));
        strokeGradient.addColorStop(1, this.hexToRgba(accentColor, 0.6));

        this.ctx.strokeStyle = strokeGradient;
        this.ctx.lineWidth = 2.5;
        this.ctx.stroke();

        // Reset shadow
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
      }

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

  // Helper to convert hex color to rgba string
  private hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  private renderAtmosphericPetals() {
    // Ambient floating petals in background using visual profile colors
    const accentColor = this.visualProfile.background.accentColor || '#ec4899';
    const petalCount = 15;
    for (let i = 0; i < petalCount; i++) {
      const x = (this.gameTime * 20 + i * 50) % (this.canvas.width + 100);
      const y = (this.gameTime * 15 + i * 40) % this.canvas.height;
      const size = 4 + (i % 3) * 2;
      const alpha = 0.1 + Math.sin(this.gameTime + i) * 0.05;

      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      // Use visual profile accent color for atmospheric petals
      this.ctx.fillStyle = accentColor;
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

    // Render with physics if available
    if (this.physicsRenderer) {
      const slashPose = this.slashTrail.length > 0;
      const facing =
        slashPose && this.slashTrail.length > 1
          ? this.slashTrail[this.slashTrail.length - 1].x >
            this.slashTrail[this.slashTrail.length - 2].x
            ? 'right'
            : 'left'
          : 'right';
      this.physicsRenderer.render(centerX, baseY, facing);

      // Draw sword overlay (keep original sword rendering)
      const breatheOffset = Math.sin(this.gameTime * 2) * 2;
      this.renderSword(breatheOffset, slashPose, centerX, baseY);

      // Power-up aura if active
      if (this.activePowerUps.size > 0) {
        const auraAlpha = 0.3 + Math.sin(this.gameTime * 5) * 0.1;
        createGlowEffect(this.ctx, centerX, baseY - 10 + breatheOffset, 60, '#4ade80', auraAlpha);
        this.ctx.save();
        this.ctx.globalAlpha = auraAlpha;
        this.ctx.strokeStyle = '#4ade80';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(centerX, baseY - 10 + breatheOffset, 60, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.restore();
      }
      return;
    }

    // Fallback to original rendering if physics not available
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
    this.renderSword(breatheOffset, slashPose, centerX, baseY);

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

  private renderSword(breatheOffset: number, slashPose: boolean, centerX: number, baseY: number) {
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
  }

  startGame() {
    this.isGameStarted = true;
    this.gameTime = 0; // Reset game time when starting
    this.lastPetalSpawn = 0; // Reset spawn timer
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
    // Cleanup physics renderer
    if (this.physicsRenderer) {
      this.physicsRenderer.dispose();
      this.physicsRenderer = null;
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
