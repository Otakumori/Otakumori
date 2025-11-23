'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { getAsset } from '../_shared/assets-resolver';

/**
 * Rhythm Beat-Em-Up Scene Component
 * Full game implementation with canvas-based rendering, rhythm synchronization,
 * procedural enemy spawning, and Clerk avatar integration
 */

interface SceneProps {
  mapUrl?: string;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
}

interface Enemy {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

// Game constants
const BPM = 128;
const BEAT_INTERVAL = 60000 / BPM; // ~469ms
const PERFECT_WINDOW = 150; // ms tolerance for perfect beat
const PLAYER_SPEED = 200; // pixels per second
const ENEMY_BASE_SPEED = 100; // pixels per second
const ENEMY_SIZE = 50;
const PLAYER_SIZE = 50;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

export default function Scene({ mapUrl }: SceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { user } = useUser();

  // UI state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);

  // Game state refs (mutable state that doesn't trigger re-renders)
  const playerRef = useRef<Player>({
    x: 100,
    y: CANVAS_HEIGHT / 2,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    health: 5,
    maxHealth: 5,
  });

  const enemiesRef = useRef<Enemy[]>([]);
  const keysPressedRef = useRef<Set<string>>(new Set());
  const scoreRef = useRef(0);
  const lastBeatTimeRef = useRef<number>(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number>(0);
  const lastAttackTimeRef = useRef<number>(0);
  const ATTACK_COOLDOWN = 200; // ms between attacks

  // Asset refs
  const backgroundImgRef = useRef<HTMLImageElement | null>(null);
  const playerSpriteRef = useRef<HTMLImageElement | null>(null);
  const enemySpriteRef = useRef<HTMLImageElement | null>(null);
  const avatarImgRef = useRef<HTMLImageElement | null>(null);

  // Asset loading
  useEffect(() => {
    const loadAssets = async () => {
      const assetsToLoad: Promise<void>[] = [];

      // Load background
      const bgUrl = getAsset('rhythm-beat-em-up', 'bg') || getAsset('rhythm-beat-em-up', 'backgrounds.city');
      if (bgUrl) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = bgUrl;
        backgroundImgRef.current = bgImg;
        assetsToLoad.push(
          new Promise((resolve, reject) => {
            bgImg.onload = () => resolve();
            bgImg.onerror = () => reject(new Error(`Failed to load background: ${bgUrl}`));
          })
        );
      }

      // Load player sprite (fallback)
      const playerSpriteUrl = getAsset('rhythm-beat-em-up', 'sprites.player');
      if (playerSpriteUrl) {
        const playerImg = new Image();
        playerImg.crossOrigin = 'anonymous';
        playerImg.src = playerSpriteUrl;
        playerSpriteRef.current = playerImg;
        assetsToLoad.push(
          new Promise((resolve, reject) => {
            playerImg.onload = () => resolve();
            playerImg.onerror = () => reject(new Error(`Failed to load player sprite: ${playerSpriteUrl}`));
          })
        );
      }

      // Load enemy sprite
      const enemySpriteUrl = getAsset('rhythm-beat-em-up', 'sprites.enemy');
      if (enemySpriteUrl) {
        const enemyImg = new Image();
        enemyImg.crossOrigin = 'anonymous';
        enemyImg.src = enemySpriteUrl;
        enemySpriteRef.current = enemyImg;
        assetsToLoad.push(
          new Promise((resolve, reject) => {
            enemyImg.onload = () => resolve();
            enemyImg.onerror = () => reject(new Error(`Failed to load enemy sprite: ${enemySpriteUrl}`));
          })
        );
      }

      // Load user avatar (Clerk)
      if (user?.imageUrl) {
        const avatarImg = new Image();
        avatarImg.crossOrigin = 'anonymous';
        avatarImg.src = user.imageUrl;
        avatarImgRef.current = avatarImg;
        assetsToLoad.push(
          new Promise((resolve) => {
            avatarImg.onload = () => resolve();
            avatarImg.onerror = () => {
              // Fallback to sprite if avatar fails
              avatarImgRef.current = playerSpriteRef.current;
              resolve();
            };
          })
        );
      } else {
        // Use sprite as fallback if no user avatar
        avatarImgRef.current = playerSpriteRef.current;
      }

      try {
        await Promise.all(assetsToLoad);
        setLoading(false);
      } catch (error) {
        console.error('Error loading assets:', error);
        // Still allow game to start with placeholders
        setLoading(false);
      }
    };

    loadAssets();
  }, [user?.imageUrl]);

  // Keyboard input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressedRef.current.add(key);

      // Start game with Enter
      if (!gameStarted && !loading && (key === 'enter' || key === ' ')) {
        startGame();
        e.preventDefault();
      }

      // Prevent default for game controls
      if (gameStarted && !gameOver) {
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'shift'].includes(key)) {
          e.preventDefault();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameStarted, loading]);

  // Collision detection (AABB)
  const checkCollision = useCallback((rect1: { x: number; y: number; width: number; height: number }, rect2: { x: number; y: number; width: number; height: number }): boolean => {
    return !(
      rect1.x + rect1.width < rect2.x ||
      rect1.x > rect2.x + rect2.width ||
      rect1.y + rect1.height < rect2.y ||
      rect1.y > rect2.y + rect2.height
    );
  }, []);

  // Spawn enemy
  const spawnEnemy = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const yPos = Math.random() * (canvas.height - ENEMY_SIZE);
    const speed = ENEMY_BASE_SPEED + Math.random() * 50;

    enemiesRef.current.push({
      id: `enemy-${Date.now()}-${Math.random()}`,
      x: canvas.width + ENEMY_SIZE,
      y: yPos,
      width: ENEMY_SIZE,
      height: ENEMY_SIZE,
      speed,
    });
  }, []);

  // Start game
  const startGame = useCallback(() => {
    if (loading) return;

    // Reset game state
    playerRef.current = {
      x: 100,
      y: CANVAS_HEIGHT / 2,
      width: PLAYER_SIZE,
      height: PLAYER_SIZE,
      health: 5,
      maxHealth: 5,
    };
    enemiesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    lastBeatTimeRef.current = performance.now();
  }, [loading]);

  // Handle retry
  const handleRetry = useCallback(() => {
    setGameOver(false);
    setGameStarted(false);
    // Reset will happen on next startGame call
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameStarted || loading || gameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    let lastTimestamp = performance.now();
    lastTimestampRef.current = lastTimestamp;

    const gameLoop = (timestamp: number) => {
      if (!gameStarted || gameOver) {
        gameLoopRef.current = null;
        return;
      }

      const dt = Math.min(0.033, (timestamp - lastTimestamp) / 1000); // Cap at 33ms (30fps minimum)
      lastTimestamp = timestamp;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      if (backgroundImgRef.current?.complete) {
        ctx.drawImage(backgroundImgRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1a0033');
        gradient.addColorStop(1, '#000000');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const player = playerRef.current;
      const keys = keysPressedRef.current;

      // Update player movement
      const speed = PLAYER_SPEED * dt;
      if (keys.has('w') || keys.has('arrowup')) {
        player.y -= speed;
      }
      if (keys.has('s') || keys.has('arrowdown')) {
        player.y += speed;
      }
      if (keys.has('a') || keys.has('arrowleft')) {
        player.x -= speed;
      }
      if (keys.has('d') || keys.has('arrowright')) {
        player.x += speed;
      }

      // Constrain player within canvas bounds
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
      player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

      // Rhythm beat system - spawn enemies on beats
      const timeSinceLastBeat = timestamp - lastBeatTimeRef.current;
      if (timeSinceLastBeat >= BEAT_INTERVAL) {
        lastBeatTimeRef.current = timestamp;
        spawnEnemy();
      }

      // Update and draw enemies
      const enemies = enemiesRef.current;
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        // Move enemy toward player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
          enemy.x += (dx / distance) * enemy.speed * dt;
          enemy.y += (dy / distance) * enemy.speed * dt;
        }

        // Draw enemy
        if (enemySpriteRef.current?.complete) {
          ctx.drawImage(enemySpriteRef.current, enemy.x, enemy.y, enemy.width, enemy.height);
        } else {
          // Fallback rectangle
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        }

        // Check collision with player
        if (checkCollision(player, enemy)) {
          const isBlocking = keys.has('shift');

          if (isBlocking) {
            // Block successful - remove enemy
            enemies.splice(i, 1);
          } else {
            // Player takes damage
            player.health -= 1;
            enemies.splice(i, 1);

            if (player.health <= 0) {
              // Game over
              setGameOver(true);
              setGameStarted(false);
              if ((window as any).__gameEnd) {
                (window as any).__gameEnd({ score: scoreRef.current, stats: { health: 0 } });
              }
              gameLoopRef.current = null;
              return;
            }
          }
        }

        // Remove enemies that are off-screen
        if (enemy.x + enemy.width < 0 || enemy.x > canvas.width || enemy.y + enemy.height < 0 || enemy.y > canvas.height) {
          enemies.splice(i, 1);
        }
      }

      // Handle attack (Space) - with cooldown
      const now = performance.now();
      if (keys.has(' ') && now - lastAttackTimeRef.current >= ATTACK_COOLDOWN) {
        lastAttackTimeRef.current = now;
        const timeSinceBeat = now - lastBeatTimeRef.current;
        const isPerfect = timeSinceBeat < PERFECT_WINDOW || (BEAT_INTERVAL - timeSinceBeat) < PERFECT_WINDOW;

        // Check for enemies in attack range (same as collision)
        for (let i = enemies.length - 1; i >= 0; i--) {
          const enemy = enemies[i];
          if (checkCollision(player, enemy)) {
            // Award score (bonus for perfect timing)
            const points = isPerfect ? 2 : 1;
            scoreRef.current += points;
            setScore(scoreRef.current);
            enemies.splice(i, 1);
          }
        }
      }

      // Draw player (avatar or sprite)
      if (avatarImgRef.current?.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImgRef.current, player.x, player.y, player.width, player.height);
        ctx.restore();
      } else if (playerSpriteRef.current?.complete) {
        ctx.drawImage(playerSpriteRef.current, player.x, player.y, player.width, player.height);
      } else {
        // Fallback rectangle
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(player.x, player.y, player.width, player.height);
      }

      // Draw HUD
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(10, 10, 200, 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText(`Health: ${player.health}/${player.maxHealth}`, 20, 35);
      ctx.fillText(`Score: ${scoreRef.current}`, 20, 60);

      // Draw beat indicator
      const timeSinceBeat = timestamp - lastBeatTimeRef.current;
      if (timeSinceBeat < 100 || BEAT_INTERVAL - timeSinceBeat < 100) {
        ctx.beginPath();
        ctx.arc(canvas.width - 30, 30, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#ff00ff';
        ctx.fill();
      }

      // Continue loop
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameStarted, loading, gameOver, checkCollision, spawnEnemy]);

  // Responsive canvas sizing
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Canvas internal resolution stays fixed, but CSS scales it
      const container = canvas.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const scale = Math.min(containerWidth / CANVAS_WIDTH, containerHeight / CANVAS_HEIGHT, 1);
        canvas.style.width = `${CANVAS_WIDTH * scale}px`;
        canvas.style.height = `${CANVAS_HEIGHT * scale}px`;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Overlay styles (unused but kept for future use)
  const _overlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    zIndex: 10,
  };

  return (
    <div className="relative w-full h-full min-h-[600px]">
      {/* Start Screen Overlay */}
      {!gameStarted && !gameOver && !loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-10 rounded-lg border border-pink-500/30">
          <h2 className="text-4xl font-bold text-pink-400 mb-4">Rhythm Beat-Em-Up</h2>
          <p className="text-white/70 mb-6">Press Enter or click Start to begin</p>
          <button
            onClick={startGame}
            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
          >
            Start Game
          </button>
          <div className="mt-8 text-sm text-white/50">
            <p>WASD / Arrow Keys: Move</p>
            <p>Space: Attack</p>
            <p>Shift: Block</p>
          </div>
        </div>
      )}

      {/* Loading Screen */}
      {loading && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-10 rounded-lg">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-white/70">Loading assets...</p>
        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center z-10 rounded-lg border border-red-500/30">
          <h2 className="text-4xl font-bold text-red-400 mb-4">Game Over</h2>
          <p className="text-white/70 mb-2">Your Score: {scoreRef.current}</p>
          <button
            onClick={handleRetry}
            className="mt-6 px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-lg border border-pink-500/20 shadow-2xl"
        style={{ maxWidth: '100%', height: 'auto' }}
        aria-label="Rhythm Beat-Em-Up game area"
      />
    </div>
  );
}
