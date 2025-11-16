/**
 * Puzzle Reveal - Tile-Based Art Unveiling Game
 * Premium aesthetic with satisfying tile-clearing mechanics
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameControls, { CONTROL_PRESETS } from '@/components/GameControls';

type GameMode = 'easy' | 'medium' | 'hard' | 'expert';

interface Tile {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isRevealed: boolean;
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

interface ArtPiece {
  url: string;
  title: string;
  artist: string;
  category: 'sfw' | 'nsfw';
}

const GRID_SIZES: Record<GameMode, { cols: number; rows: number; timeBonus: number }> = {
  easy: { cols: 4, rows: 3, timeBonus: 5000 },
  medium: { cols: 6, rows: 5, timeBonus: 8000 },
  hard: { cols: 8, rows: 6, timeBonus: 12000 },
  expert: { cols: 10, rows: 8, timeBonus: 20000 },
};

// Curated art collection - uses Otaku-mori art assets
// TODO: Add actual Otaku-mori artwork (including spicier ones as content library grows)
// Current placeholders will be replaced with real assets
const ART_COLLECTION: ArtPiece[] = [
  {
    url: '/assets/reveal/anime-landscape-1.jpg',
    title: 'Cherry Blossom Shrine',
    artist: 'Otaku-mori Studios',
    category: 'sfw',
  },
  {
    url: '/assets/reveal/anime-character-1.jpg',
    title: 'Sakura Guardian',
    artist: 'Otaku-mori Studios',
    category: 'sfw',
  },
  // Add more art pieces here - including spicier ones as content library grows
];

export default function EnhancedTileGame({ 
  mode = 'medium',
  onScoreChange,
  onComboChange,
  onGameEnd,
}: { 
  mode?: GameMode;
  onScoreChange?: (score: number) => void;
  onComboChange?: (combo: number) => void;
  onGameEnd?: (score: number, didWin: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const tilesRef = useRef<Tile[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastClickTimeRef = useRef<number>(0);

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

  const [currentArt, setCurrentArt] = useState<ArtPiece | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize game
  useEffect(() => {
    // Select random art piece
    const selectedArt = ART_COLLECTION[Math.floor(Math.random() * ART_COLLECTION.length)];
    setCurrentArt(selectedArt);

    // Load image
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Use placeholder if asset doesn't exist
    img.src = selectedArt.url;
    img.onerror = () => {
      // Fallback to procedural gradient
      img.src = generateFallbackImage(800, 600);
    };

    img.onload = () => {
      imageRef.current = img;
      initializeTiles();
      setIsLoading(false);
      startGameLoop();
    };

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mode]);

  // Generate fallback placeholder image
  const generateFallbackImage = (width: number, height: number): string => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    // Beautiful sakura gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#ff9fbe');
    gradient.addColorStop(0.5, '#ec4899');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add decorative elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 20 + Math.random() * 60;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas.toDataURL();
  };

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
          particles: [],
          revealProgress: 0,
          comboMultiplier: 1,
        });
      }
    }

    tilesRef.current = tiles;
    setGameState((prev) => ({
      ...prev,
      totalTiles: tiles.length,
    }));
  };

  // Handle tile click
  const handleCanvasClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (gameState.isComplete || gameState.isPaused || !canvasRef.current) return;

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
          clickX >= tile.x &&
          clickX <= tile.x + tile.width &&
          clickY >= tile.y &&
          clickY <= tile.y + tile.height,
      );

      if (clickedTile) {
        revealTile(clickedTile);
      }
    },
    [gameState.isComplete, gameState.isPaused],
  );

  // Reveal tile with satisfying effects
  const revealTile = (tile: Tile) => {
    tile.isRevealed = true;

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
        color: ['#ff9fbe', '#ec4899', '#ffc7d9', '#ff6bc1'][Math.floor(Math.random() * 4)],
      });
    }

    // Calculate combo
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    let newCombo = gameState.combo;
    if (timeSinceLastClick < 500) {
      // Fast click - increase combo
      newCombo = Math.min(gameState.combo + 1, 10);
    } else if (timeSinceLastClick > 2000) {
      // Too slow - reset combo
      newCombo = 0;
    }

    // Calculate score
    const baseScore = 100;
    const comboBonus = newCombo * 50;
    const tileScore = baseScore + comboBonus;

    const newScore = gameState.score + tileScore;
    setGameState((prev) => ({
      ...prev,
      score: newScore,
      tilesRevealed: prev.tilesRevealed + 1,
      combo: newCombo,
      maxCombo: Math.max(prev.maxCombo, newCombo),
    }));
    
    // Notify parent of state changes
    if (onScoreChange) {
      onScoreChange(newScore);
    }
    if (onComboChange) {
      onComboChange(newCombo);
    }

    // Check for completion
    if (gameState.tilesRevealed + 1 >= gameState.totalTiles) {
      completeGame();
    }
  };

  // Complete game
  const completeGame = () => {
    const timeElapsed = Date.now() - startTimeRef.current;
    const { timeBonus } = GRID_SIZES[mode];
    const timeBonusScore = Math.max(0, timeBonus - Math.floor(timeElapsed / 1000) * 10);
    const finalScore = gameState.score + timeBonusScore;

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

    // Submit score
    submitScore(finalScore);
  };

  // Submit score to leaderboard
  const submitScore = async (finalScore: number) => {
    const petalReward = Math.floor(finalScore / 100);

    try {
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

      // Submit to leaderboard
      await fetch('/api/v1/leaderboards/puzzle-reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: Math.max(0, Math.round(finalScore)),
          metadata: { mode, maxCombo: gameState.maxCombo },
        }),
      });
    } catch (error) {
      console.error('Failed to submit score:', error);
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

      // Draw tiles
      tilesRef.current.forEach((tile) => {
        if (tile.isRevealed) {
          // Draw revealed portion of image
          ctx.save();
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

          // Draw subtle glow border
          ctx.strokeStyle = 'rgba(255, 155, 190, 0.5)';
          ctx.lineWidth = 2;
          ctx.strokeRect(tile.x, tile.y, tile.width, tile.height);
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

          // Draw dark overlay
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(tile.x, tile.y, tile.width, tile.height);

          // Draw grid border
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(tile.x, tile.y, tile.width, tile.height);

          // Draw hover effect (simplified - would need mouse tracking)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
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

      if (!gameState.isPaused) {
        animationRef.current = requestAnimationFrame(render);
      }
    };

    render();
  };

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
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-pink-200 font-medium">Preparing artwork...</p>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto cursor-pointer rounded-2xl border border-pink-500/20 shadow-2xl transition-all hover:border-pink-500/40"
        onClick={handleCanvasClick}
        aria-label="Puzzle Reveal game area - click tiles to reveal the hidden artwork"
      />

      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <div className="bg-black/80 backdrop-blur-lg px-4 py-2 rounded-xl border border-pink-500/30 text-pink-200 font-medium">
          Score: <span className="text-pink-400 font-bold">{gameState.score.toLocaleString()}</span>
        </div>
        <div className="bg-black/80 backdrop-blur-lg px-4 py-2 rounded-xl border border-pink-500/30 text-pink-200 font-medium">
          Progress: <span className="text-pink-400 font-bold">{revealPercent}%</span>
        </div>
        {gameState.combo > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-pink-500/40 to-purple-500/40 backdrop-blur-lg px-4 py-2 rounded-xl border border-pink-400/50 text-white font-bold"
          >
            <span className="text-yellow-300 font-semibold" aria-hidden="true">
              Combo
            </span>{' '}
            {gameState.combo}x COMBO!
          </motion.div>
        )}
      </div>

      {/* Art Info */}
      {currentArt && (
        <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-lg px-4 py-2 rounded-xl border border-pink-500/30 text-right">
          <p className="text-pink-400 font-bold text-sm">{currentArt.title}</p>
          <p className="text-pink-200/70 text-xs">by {currentArt.artist}</p>
        </div>
      )}

      {/* Game Complete Screen */}
      <AnimatePresence>
        {gameState.isComplete && (
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-black/90 to-pink-900/20 backdrop-blur-xl border-2 border-pink-500/50 rounded-3xl p-8 text-center max-w-md mx-4 shadow-2xl"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', damping: 15 }}
            >
              <motion.h2
                className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Masterpiece Revealed!
              </motion.h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-pink-200">Final Score:</span>
                  <span className="text-pink-400 font-bold text-xl">
                    {gameState.score.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pink-200">Max Combo:</span>
                  <span className="text-yellow-400 font-bold">{gameState.maxCombo}x</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pink-200">Difficulty:</span>
                  <span className="text-purple-400 font-bold capitalize">{mode}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-pink-200">Time:</span>
                  <span className="text-blue-400 font-bold">{gameState.timeElapsed}s</span>
                </div>
              </div>

              <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-4 mb-6">
                <p className="text-pink-100 text-lg">
                  <span className="text-2xl font-semibold" aria-hidden="true">
                    Petal
                  </span>{' '}
                  Petals Earned:{' '}
                  <span className="font-bold text-pink-400">
                    {Math.floor(gameState.score / 100)}
                  </span>
                </p>
              </div>

              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-pink-500/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                onClick={() => window.location.reload()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
