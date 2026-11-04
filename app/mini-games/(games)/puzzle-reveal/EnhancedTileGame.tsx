/**
 * Puzzle Reveal - Tile-Based Art Unveiling Game
 * Premium aesthetic with satisfying tile-clearing mechanics
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GameControls, { CONTROL_PRESETS } from '@/components/GameControls';
import type { PersonalBestResult } from '@/app/lib/games/progress';
import {
  completePuzzleRevealRun,
  createPuzzleRevealRun,
  recordPuzzleRevealTile,
} from './puzzleRevealRun';
import {
  easingFunctions,
  createPetalBurst,
  updatePetalParticles,
  type PetalParticle,
} from '../../_shared/vfx';
import { PUZZLE_REVEAL_CONTENT } from './puzzleRevealContent';

type GameMode = 'easy' | 'medium' | 'hard' | 'expert';

interface Tile {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isRevealed: boolean;
  isRevealing: boolean;
  particles: TileParticle[];
  revealProgress: number;
  comboMultiplier: number;
}

interface TileParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

interface GameState {
  score: number;
  tilesRevealed: number;
  totalTiles: number;
  combo: number;
  maxCombo: number;
  timeElapsed: number;
  isComplete: boolean;
  isPaused: boolean;
}

const GRID_SIZES: Record<GameMode, { cols: number; rows: number; timeBonus: number }> = {
  easy: { cols: 4, rows: 3, timeBonus: 5000 },
  medium: { cols: 6, rows: 5, timeBonus: 8000 },
  hard: { cols: 8, rows: 6, timeBonus: 12000 },
  expert: { cols: 10, rows: 8, timeBonus: 20000 },
};

export default function EnhancedTileGame({
  mode = 'medium',
  contentIndex = 0,
  onScoreChange,
  onComboChange,
  onGameEnd,
  onReplay,
  onBack,
  personalBest,
  petalReward,
  paused,
  physicsAvatarRef,
}: {
  mode?: GameMode;
  contentIndex?: number;
  onScoreChange?: (score: number) => void;
  onComboChange?: (combo: number) => void;
  onGameEnd?: (score: number, didWin: boolean) => void;
  onReplay?: () => void;
  onBack?: () => void;
  personalBest?: PersonalBestResult | null;
  petalReward?: number | null;
  paused?: boolean;
  physicsAvatarRef?: React.RefObject<{
    applyImpact: (force: { x: number; y: number }, part: string) => void;
  }>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const tilesRef = useRef<Tile[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastClickTimeRef = useRef<number>(0);
  const pausedRef = useRef(paused ?? false);
  const previousPausedRef = useRef(paused);
  const pauseStartedAtRef = useRef<number | null>(null);
  const resumeLoopRef = useRef<() => void>(() => {});
  const isCompleteRef = useRef(false);
  const runProgressRef = useRef(createPuzzleRevealRun(0));
  const comboRef = useRef(0);

  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    tilesRevealed: 0,
    totalTiles: 0,
    combo: 0,
    maxCombo: 0,
    timeElapsed: 0,
    isComplete: false,
    isPaused: false,
  });

  const [currentArt, setCurrentArt] = useState<(typeof PUZZLE_REVEAL_CONTENT)[number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [assetError, setAssetError] = useState(false);
  const [completionVfx, setCompletionVfx] = useState<{
    active: boolean;
    scale: number;
    opacity: number;
  }>({ active: false, scale: 1, opacity: 0 });
  const [petalParticles, setPetalParticles] = useState<PetalParticle[]>([]);

  useEffect(() => {
    if (paused === undefined) return;

    const wasPaused = previousPausedRef.current;
    previousPausedRef.current = paused;
    pausedRef.current = paused;
    setGameState((current) =>
      current.isPaused === paused ? current : { ...current, isPaused: paused },
    );

    if (paused) {
      pauseStartedAtRef.current = Date.now();
      if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    } else if (wasPaused === true) {
      if (pauseStartedAtRef.current !== null) {
        startTimeRef.current += Date.now() - pauseStartedAtRef.current;
        pauseStartedAtRef.current = null;
      }
      resumeLoopRef.current();
    }
  }, [paused]);

  // Initialize game
  useEffect(() => {
    const selectedArt = PUZZLE_REVEAL_CONTENT[contentIndex % PUZZLE_REVEAL_CONTENT.length]!;
    setCurrentArt(selectedArt);
    isCompleteRef.current = false;
    runProgressRef.current = createPuzzleRevealRun(0);
    comboRef.current = 0;

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.src = selectedArt.url;
    img.onerror = () => {
      imageRef.current = null;
      setAssetError(true);
      setIsLoading(false);
    };

    img.onload = () => {
      imageRef.current = img;
      setAssetError(false);
      initializeTiles();
      setIsLoading(false);
      startGameLoop();
    };

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [contentIndex, mode]);

  // Initialize tile grid
  const initializeTiles = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const { cols, rows } = GRID_SIZES[mode];
    const tileWidth = canvas.width / cols;
    const tileHeight = canvas.height / rows;

    const tiles: Tile[] = [];
    let tileId = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        tiles.push({
          id: `tile-${tileId++}`,
          x: col * tileWidth,
          y: row * tileHeight,
          width: tileWidth,
          height: tileHeight,
          isRevealed: false,
          isRevealing: false,
          particles: [],
          revealProgress: 0,
          comboMultiplier: 1,
        });
      }
    }

    tilesRef.current = tiles;
    runProgressRef.current = createPuzzleRevealRun(tiles.length);
    setGameState((prev) => ({
      ...prev,
      totalTiles: tiles.length,
    }));
  };

  // Handle tile click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (
      gameState.isComplete ||
      gameState.isPaused ||
      runProgressRef.current.completionScheduled ||
      !canvasRef.current
    )
      return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    // Find clicked tile
    const clickedTile = tilesRef.current.find(
      (tile) =>
        !tile.isRevealed &&
        !tile.isRevealing &&
        clickX >= tile.x &&
        clickX <= tile.x + tile.width &&
        clickY >= tile.y &&
        clickY <= tile.y + tile.height,
    );

    if (clickedTile) {
      revealTile(clickedTile);
    }
  };

  // Reveal tile with satisfying effects
  const revealTile = (tile: Tile) => {
    if (tile.isRevealed || tile.isRevealing || runProgressRef.current.completionScheduled) return;

    // Start reveal animation (progress from 0 to 1)
    tile.revealProgress = 0;
    tile.isRevealing = true;

    // Animate reveal progress
    const revealDuration = 300; // ms
    const startTime = Date.now();
    const animateReveal = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / revealDuration);
      tile.revealProgress = easingFunctions.easeOutCubic(progress);

      if (progress < 1) {
        requestAnimationFrame(animateReveal);
      } else {
        tile.isRevealed = true;
        tile.isRevealing = false;
        tile.revealProgress = 1;
      }
    };
    animateReveal();

    // Spawn particle burst
    const particleCount = 15 + Math.floor(Math.random() * 10);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5);
      const speed = 2 + Math.random() * 4;

      tile.particles.push({
        x: tile.x + tile.width / 2,
        y: tile.y + tile.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1, // Slight upward bias
        life: 1.0,
        size: 4 + Math.random() * 6,
        color: ['#d8b06b', '#8b6a42', '#c98798', '#62564f'][Math.floor(Math.random() * 4)],
      });
    }

    // Create petal burst particles
    const burst = createPetalBurst(tile.x + tile.width / 2, tile.y + tile.height / 2, 8, {
      speed: 2.5,
      spread: Math.PI * 2,
    });
    setPetalParticles((prev) => [...prev, ...burst]);

    // Calculate combo
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    let newCombo = comboRef.current;
    if (timeSinceLastClick < 500) {
      // Fast click - increase combo
      newCombo = Math.min(comboRef.current + 1, 10);
    } else if (timeSinceLastClick > 2000) {
      // Too slow - reset combo
      newCombo = 0;
    }
    comboRef.current = newCombo;

    // Calculate score
    const baseScore = 100;
    const comboBonus = newCombo * 50;
    const tileScore = baseScore + comboBonus;

    const revealResult = recordPuzzleRevealTile(runProgressRef.current, tileScore);
    if (!revealResult.accepted) {
      tile.isRevealing = false;
      return;
    }
    runProgressRef.current = revealResult.progress;
    const newScore = revealResult.progress.score;
    setGameState((prev) => ({
      ...prev,
      score: newScore,
      tilesRevealed: revealResult.progress.tilesRevealed,
      combo: newCombo,
      maxCombo: Math.max(prev.maxCombo, newCombo),
    }));

    // Apply physics impact based on combo
    if (physicsAvatarRef?.current) {
      const impactForce = {
        x: (Math.random() - 0.5) * 2,
        y: -2 - Math.min(newCombo * 0.3, 2), // Stronger impact for higher combos
      };
      physicsAvatarRef.current.applyImpact(impactForce, 'chest');
    }

    // Notify parent of state changes
    if (onScoreChange) {
      onScoreChange(newScore);
    }
    if (onComboChange) {
      onComboChange(newCombo);
    }

    // Check for completion
    if (revealResult.shouldComplete) {
      // Trigger completion VFX
      setCompletionVfx({ active: true, scale: 1, opacity: 1 });

      // Create massive petal burst at center
      if (canvasRef.current) {
        const burst = createPetalBurst(
          canvasRef.current.width / 2,
          canvasRef.current.height / 2,
          30,
          {
            speed: 4,
            spread: Math.PI * 2,
          },
        );
        setPetalParticles((prev) => [...prev, ...burst]);
      }

      // Animate completion zoom/pulse
      const startTime = Date.now();
      const animateCompletion = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / 1500); // 1.5s animation

        if (progress < 0.3) {
          // Zoom in phase
          const zoomProgress = progress / 0.3;
          setCompletionVfx({
            active: true,
            scale: 1 + easingFunctions.easeOutCubic(zoomProgress) * 0.1,
            opacity: 1,
          });
        } else if (progress < 0.7) {
          // Pulse phase
          const pulseProgress = (progress - 0.3) / 0.4;
          const pulse = Math.sin(pulseProgress * Math.PI * 2) * 0.05;
          setCompletionVfx({
            active: true,
            scale: 1.1 + pulse,
            opacity: 1 - pulseProgress * 0.3,
          });
        } else {
          // Fade out
          const fadeProgress = (progress - 0.7) / 0.3;
          setCompletionVfx({
            active: true,
            scale: 1.05,
            opacity: 0.7 * (1 - fadeProgress),
          });
        }

        if (progress < 1) {
          requestAnimationFrame(animateCompletion);
        } else {
          setCompletionVfx({ active: false, scale: 1, opacity: 0 });
          completeGame(newScore);
        }
      };
      animateCompletion();
    }
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

  // Complete game
  const completeGame = (revealedScore: number) => {
    const completion = completePuzzleRevealRun(runProgressRef.current);
    runProgressRef.current = completion.progress;
    if (!completion.didComplete) return;

    const timeElapsed = Date.now() - startTimeRef.current;
    const { timeBonus } = GRID_SIZES[mode];
    const timeBonusScore = Math.max(0, timeBonus - Math.floor(timeElapsed / 1000) * 10);
    const finalScore = revealedScore + timeBonusScore;

    isCompleteRef.current = true;
    setGameState((prev) => ({
      ...prev,
      isComplete: true,
      timeElapsed: Math.floor(timeElapsed / 1000),
      score: finalScore,
    }));

    // Notify parent of game completion
    if (onGameEnd) {
      onGameEnd(finalScore, true); // didWin = true (completed puzzle)
    }
  };

  // Game loop
  const startGameLoop = () => {
    const render = () => {
      if (!canvasRef.current || !imageRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d')!;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (isCompleteRef.current) {
        ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(199, 151, 78, 0.72)';
        ctx.lineWidth = 3;
        ctx.strokeRect(1.5, 1.5, canvas.width - 3, canvas.height - 3);
        return;
      }

      // Draw tiles
      tilesRef.current.forEach((tile) => {
        const isRevealing = tile.revealProgress > 0 && tile.revealProgress < 1;
        const isFullyRevealed = tile.isRevealed || tile.revealProgress >= 1;

        if (isFullyRevealed || isRevealing) {
          // Draw revealed portion of image with flip animation
          ctx.save();

          // Apply flip animation
          const centerX = tile.x + tile.width / 2;
          const centerY = tile.y + tile.height / 2;

          if (isRevealing) {
            // Animate flip: rotateY from 90deg to 0deg
            const rotation = ((1 - tile.revealProgress) * Math.PI) / 2; // 90deg to 0deg
            ctx.translate(centerX, centerY);
            ctx.scale(Math.cos(rotation), 1); // Perspective effect
            ctx.translate(-centerX, -centerY);
          }

          ctx.beginPath();
          ctx.rect(tile.x, tile.y, tile.width, tile.height);
          ctx.clip();
          ctx.drawImage(
            imageRef.current!,
            tile.x,
            tile.y,
            tile.width,
            tile.height,
            tile.x,
            tile.y,
            tile.width,
            tile.height,
          );
          ctx.restore();

          // Draw restrained recovered-memory fracture light.
          const glowIntensity = isRevealing ? tile.revealProgress : 1;
          ctx.strokeStyle = `rgba(202, 155, 84, ${0.42 * glowIntensity})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(tile.x, tile.y, tile.width, tile.height);

          // Add pulse effect for newly revealed tiles
          if (isRevealing && tile.revealProgress > 0.8) {
            const pulse = Math.sin((tile.revealProgress - 0.8) * 5 * Math.PI) * 0.3;
            ctx.strokeStyle = `rgba(224, 186, 116, ${0.68 + pulse})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(tile.x - 2, tile.y - 2, tile.width + 4, tile.height + 4);
          }
        } else {
          // Draw pixelated/blurred preview
          ctx.save();
          ctx.filter = 'blur(20px)';
          ctx.globalAlpha = 0.3;
          ctx.drawImage(
            imageRef.current!,
            tile.x,
            tile.y,
            tile.width,
            tile.height,
            tile.x,
            tile.y,
            tile.width,
            tile.height,
          );
          ctx.restore();

          // Petrified black-lacquer corruption layer.
          ctx.fillStyle = 'rgba(10, 9, 8, 0.78)';
          ctx.fillRect(tile.x, tile.y, tile.width, tile.height);

          const mineralVein = ctx.createLinearGradient(
            tile.x,
            tile.y,
            tile.x + tile.width,
            tile.y + tile.height,
          );
          mineralVein.addColorStop(0, 'rgba(42, 37, 32, 0.56)');
          mineralVein.addColorStop(0.55, 'rgba(18, 16, 14, 0.2)');
          mineralVein.addColorStop(1, 'rgba(114, 74, 51, 0.3)');
          ctx.fillStyle = mineralVein;
          ctx.fillRect(tile.x + 2, tile.y + 2, tile.width - 4, tile.height - 4);

          // Draw grid border
          ctx.strokeStyle = 'rgba(172, 126, 70, 0.38)';
          ctx.lineWidth = 1;
          ctx.strokeRect(tile.x, tile.y, tile.width, tile.height);

          // A restrained sakura fracture catches light through the crust.
          ctx.fillStyle = 'rgba(190, 111, 128, 0.08)';
          ctx.fillRect(tile.x + 2, tile.y + 2, tile.width - 4, tile.height - 4);
        }

        // Update and draw particles
        tile.particles = tile.particles.filter((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vy += 0.15; // Gravity
          particle.vx *= 0.98; // Air resistance
          particle.life -= 0.02;

          if (particle.life > 0) {
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return true;
          }
          return false;
        });
      });

      // Draw completion VFX overlay
      if (completionVfx.active) {
        ctx.save();
        ctx.globalAlpha = completionVfx.opacity * 0.3;
        ctx.fillStyle = 'rgba(161, 115, 58, 0.36)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw radial pulse
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          0,
          canvas.width / 2,
          canvas.height / 2,
          Math.max(canvas.width, canvas.height) * completionVfx.scale,
        );
        gradient.addColorStop(0, 'rgba(229, 194, 125, 0.74)');
        gradient.addColorStop(0.5, 'rgba(169, 116, 58, 0.3)');
        gradient.addColorStop(1, 'rgba(84, 54, 32, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      // Draw petal particles overlay
      if (petalParticles.length > 0) {
        petalParticles.forEach((particle) => {
          ctx.save();
          ctx.globalAlpha = particle.alpha;
          ctx.fillStyle = '#c98798';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 4 * particle.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      if (!pausedRef.current) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    render();
  };
  resumeLoopRef.current = startGameLoop;

  // Calculate reveal percentage
  const revealPercent =
    gameState.totalTiles > 0
      ? Math.round((gameState.tilesRevealed / gameState.totalTiles) * 100)
      : 0;

  return (
    <div className="relative">
      {/* Keyboard Controls */}
      <GameControls
        game="Puzzle Reveal"
        controls={[...CONTROL_PRESETS['puzzle-reveal']]}
        position="bottom-left"
        autoHideDelay={8000}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-lg rounded-2xl">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-amber-700/70 border-t-transparent motion-reduce:animate-none animate-spin" />
            <p className="font-medium text-amber-100">Preparing recovered memory...</p>
          </div>
        </div>
      )}
      {assetError && (
        <div
          role="status"
          className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-zinc-950/95 p-6 text-center text-zinc-100"
        >
          <div>
            <p className="font-semibold">Artwork unavailable</p>
            <p className="mt-2 text-sm text-zinc-300">
              This puzzle cannot begin without its approved reveal image.
            </p>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className={`h-auto w-full rounded-2xl border border-amber-700/30 shadow-2xl transition-colors ${
          gameState.isComplete ? 'cursor-default' : 'cursor-pointer hover:border-amber-500/50'
        }`}
        onClick={handleCanvasClick}
        aria-label={
          gameState.isComplete
            ? `${currentArt?.title ?? 'Recovered artwork'} fully restored`
            : 'Puzzle Reveal game area - click tiles to reveal the hidden artwork'
        }
      />

      {/* HUD Overlay */}
      {!gameState.isComplete && (
        <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
          <div className="rounded-xl border border-amber-700/40 bg-stone-950/85 px-4 py-2 font-medium text-amber-100 backdrop-blur-lg">
            Score:{' '}
            <span className="font-bold text-amber-300">{gameState.score.toLocaleString()}</span>
          </div>
          <div className="rounded-xl border border-amber-700/40 bg-stone-950/85 px-4 py-2 font-medium text-amber-100 backdrop-blur-lg">
            Progress: <span className="font-bold text-amber-300">{revealPercent}%</span>
          </div>
          {gameState.combo > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-xl border border-rose-300/30 bg-gradient-to-r from-stone-950/90 to-rose-950/55 px-4 py-2 font-bold text-white backdrop-blur-lg"
            >
              <span className="text-yellow-300 font-semibold" aria-hidden="true">
                Combo
              </span>{' '}
              {gameState.combo}x COMBO!
            </motion.div>
          )}
        </div>
      )}

      {/* Art Info */}
      {currentArt && (
        <div className="pointer-events-none absolute right-4 top-4 rounded-xl border border-amber-700/40 bg-stone-950/85 px-4 py-2 text-right backdrop-blur-lg">
          <p className="text-sm font-bold text-amber-200">{currentArt.title}</p>
          <p className="text-xs text-stone-300">by {currentArt.artist}</p>
        </div>
      )}

      {gameState.isComplete && currentArt && (
        <motion.section
          aria-live="polite"
          className="mt-4 rounded-2xl border border-amber-700/45 bg-gradient-to-br from-stone-950 via-stone-950 to-rose-950/35 p-4 text-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-400/80">
                Recovered memory
              </p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-amber-100">
                {currentArt.title}
              </h2>
              <p className="mt-1 text-sm text-stone-300">
                The corrupted memory has been fully restored.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-stone-400">Score</dt>
                <dd className="font-semibold text-amber-200">{gameState.score.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-stone-400">Time</dt>
                <dd className="font-semibold text-amber-200">{gameState.timeElapsed}s</dd>
              </div>
              <div>
                <dt className="text-stone-400">Best combo</dt>
                <dd className="font-semibold text-amber-200">{gameState.maxCombo}x</dd>
              </div>
              <div>
                <dt className="text-stone-400">Difficulty</dt>
                <dd className="font-semibold capitalize text-amber-200">{mode}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-amber-800/35 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-stone-300" role="status">
              {personalBest?.status === 'unavailable' ? (
                <span>Score not saved. The restored memory remains visible.</span>
              ) : personalBest?.currentBest !== null && personalBest?.currentBest !== undefined ? (
                <span>
                  {personalBest.isNewBest ? 'New personal best' : 'Personal best'}:{' '}
                  <strong className="text-amber-200">
                    {personalBest.currentBest.toLocaleString()}
                  </strong>
                </span>
              ) : (
                <span>Personal best sync pending.</span>
              )}
              {petalReward !== null && petalReward !== undefined && petalReward > 0 ? (
                <span className="ml-3 text-rose-200">+{petalReward} Petals</span>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2">
              {onReplay ? (
                <button
                  type="button"
                  onClick={onReplay}
                  className="min-h-11 rounded-xl border border-amber-500/50 bg-amber-700/25 px-4 py-2 text-sm font-semibold text-amber-100 transition-colors hover:bg-amber-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                >
                  Restore next artifact
                </button>
              ) : null}
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="min-h-11 rounded-xl border border-stone-600 bg-stone-900/80 px-4 py-2 text-sm font-semibold text-stone-100 transition-colors hover:border-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-300"
                >
                  Return to hub
                </button>
              ) : null}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  );
}
