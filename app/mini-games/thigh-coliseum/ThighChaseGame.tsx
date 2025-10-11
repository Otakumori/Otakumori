'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameSave } from '../_shared/SaveSystem';

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'low' | 'high' | 'wide';
  speed: number;
}

interface Powerup {
  id: number;
  x: number;
  y: number;
  type: 'speed' | 'shield' | 'points';
  collected: boolean;
}

export default function ThighChaseGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const keysRef = useRef<Set<string>>(new Set());

  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [stage, setStage] = useState(1);
  const [lives, setLives] = useState(3);

  // Player state
  const [player, setPlayer] = useState({
    x: 100,
    y: 300,
    width: 30,
    height: 40,
    velocityY: 0,
    onGround: true,
    invulnerable: 0,
    shielded: 0,
    speedBoost: 0,
  });

  // Pursuer (Mr. X-like thighs)
  const [pursuer, setPursuer] = useState({
    x: -200,
    y: 280,
    width: 80,
    height: 80,
    speed: 2,
    catching: false,
  });

  // Game objects
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [powerups, setPowerups] = useState<Powerup[]>([]);

  // Game timing
  const [gameTime, setGameTime] = useState(0);
  const [obstacleSpawnTimer, setObstacleSpawnTimer] = useState(0);
  const [powerupSpawnTimer, setPowerupSpawnTimer] = useState(0);
  const [nextObstacleId, setNextObstacleId] = useState(1);
  const [nextPowerupId, setNextPowerupId] = useState(1);

  const { saveOnExit, autoSave } = useGameSave('thigh-coliseum');

  // Game constants
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const GROUND_Y = 400;
  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const BASE_SPEED = 4;

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setDistance(0);
    setStage(1);
    setLives(3);
    setGameTime(0);
    setPlayer({
      x: 100,
      y: GROUND_Y - 40,
      width: 30,
      height: 40,
      velocityY: 0,
      onGround: true,
      invulnerable: 0,
      shielded: 0,
      speedBoost: 0,
    });
    setPursuer({
      x: -200,
      y: GROUND_Y - 80,
      width: 80,
      height: 80,
      speed: 2,
      catching: false,
    });
    setObstacles([]);
    setPowerups([]);
    setObstacleSpawnTimer(0);
    setPowerupSpawnTimer(0);
    setNextObstacleId(1);
    setNextPowerupId(1);
  }, []);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());

      if (e.key === 'Escape') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev));
      }

      if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') && gameState === 'playing') {
        jump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Jump action
  const jump = useCallback(() => {
    setPlayer((prev) => {
      if (prev.onGround) {
        return { ...prev, velocityY: JUMP_FORCE, onGround: false };
      }
      return prev;
    });
  }, []);

  // Spawn obstacle
  const spawnObstacle = useCallback(() => {
    const obstacleTypes = [
      { type: 'low' as const, width: 40, height: 30, y: GROUND_Y - 30 },
      { type: 'high' as const, width: 30, height: 60, y: GROUND_Y - 60 },
      { type: 'wide' as const, width: 80, height: 40, y: GROUND_Y - 40 },
    ];

    const template = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const speed = BASE_SPEED + stage * 0.5;

    const newObstacle: Obstacle = {
      id: nextObstacleId,
      x: CANVAS_WIDTH + 50,
      y: template.y,
      width: template.width,
      height: template.height,
      type: template.type,
      speed,
    };

    setObstacles((prev) => [...prev, newObstacle]);
    setNextObstacleId((prev) => prev + 1);
  }, [stage, nextObstacleId]);

  // Spawn powerup
  const spawnPowerup = useCallback(() => {
    const powerupTypes = ['speed', 'shield', 'points'] as const;
    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];

    const newPowerup: Powerup = {
      id: nextPowerupId,
      x: CANVAS_WIDTH + 30,
      y: GROUND_Y - 100 - Math.random() * 100, // Floating in air
      type,
      collected: false,
    };

    setPowerups((prev) => [...prev, newPowerup]);
    setNextPowerupId((prev) => prev + 1);
  }, [nextPowerupId]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      const deltaTime = 16; // ~60fps
      setGameTime((prev) => prev + deltaTime);

      // Update distance
      setDistance((prev) => {
        const newDistance = prev + (BASE_SPEED + stage * 0.5);

        // Stage progression every 1000 distance units
        if (Math.floor(newDistance / 1000) > stage - 1) {
          setStage((s) => s + 1);
        }

        return newDistance;
      });

      // Player physics
      setPlayer((prev) => {
        let newY = prev.y + prev.velocityY;
        let newVelocityY = prev.velocityY;
        let newOnGround = prev.onGround;
        let newInvulnerable = Math.max(0, prev.invulnerable - deltaTime);
        let newShielded = Math.max(0, prev.shielded - deltaTime);
        let newSpeedBoost = Math.max(0, prev.speedBoost - deltaTime);

        // Apply gravity
        if (!prev.onGround) {
          newVelocityY += GRAVITY;
        }

        // Ground collision
        if (newY >= GROUND_Y - prev.height) {
          newY = GROUND_Y - prev.height;
          newVelocityY = 0;
          newOnGround = true;
        }

        // Horizontal movement
        let newX = prev.x;
        const speed = newSpeedBoost > 0 ? 6 : 4;

        if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) {
          newX = Math.max(50, newX - speed);
        }
        if (keysRef.current.has('d') || keysRef.current.has('arrowright')) {
          newX = Math.min(CANVAS_WIDTH - 100, newX + speed);
        }

        return {
          ...prev,
          x: newX,
          y: newY,
          velocityY: newVelocityY,
          onGround: newOnGround,
          invulnerable: newInvulnerable,
          shielded: newShielded,
          speedBoost: newSpeedBoost,
        };
      });

      // Update pursuer (always getting closer)
      setPursuer((prev) => {
        const targetDistance = 150; // Ideal distance behind player
        const currentDistance = player.x - prev.x;
        let newSpeed = prev.speed + 0.01; // Gradually getting faster

        if (currentDistance < 50) {
          // Too close - catching the player
          return { ...prev, catching: true, speed: newSpeed };
        } else if (currentDistance > targetDistance) {
          // Too far - speed up
          newSpeed += 0.5;
        }

        return {
          ...prev,
          x: prev.x + newSpeed,
          speed: newSpeed,
          catching: false,
        };
      });

      // Spawn obstacles
      setObstacleSpawnTimer((prev) => {
        const spawnRate = Math.max(800, 2000 - stage * 100); // Faster spawning each stage
        if (prev <= 0) {
          if (Math.random() < 0.7) spawnObstacle();
          return spawnRate;
        }
        return prev - deltaTime;
      });

      // Spawn powerups
      setPowerupSpawnTimer((prev) => {
        if (prev <= 0) {
          if (Math.random() < 0.3) spawnPowerup();
          return 5000; // Every 5 seconds chance
        }
        return prev - deltaTime;
      });

      // Update obstacles
      setObstacles((prev) =>
        prev
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - obstacle.speed }))
          .filter((obstacle) => obstacle.x > -100),
      );

      // Update powerups
      setPowerups((prev) =>
        prev
          .map((powerup) => ({ ...powerup, x: powerup.x - (BASE_SPEED + stage * 0.5) }))
          .filter((powerup) => powerup.x > -50 && !powerup.collected),
      );

      // Collision detection
      // Player vs Obstacles
      if (player.invulnerable <= 0 && player.shielded <= 0) {
        setObstacles((prevObstacles) => {
          let playerHit = false;
          const result = prevObstacles.filter((obstacle) => {
            const collision =
              obstacle.x < player.x + player.width &&
              obstacle.x + obstacle.width > player.x &&
              obstacle.y < player.y + player.height &&
              obstacle.y + obstacle.height > player.y;
            if (collision && !playerHit) {
              playerHit = true;
              setLives((l) => l - 1);
              setPlayer((prev) => ({ ...prev, invulnerable: 2000 })); // 2 second invulnerability
              return false; // Remove obstacle
            }
            return true;
          });
          return result;
        });
      }

      // Player vs Powerups
      setPowerups((prevPowerups) => {
        return prevPowerups.map((powerup) => {
          if (powerup.collected) return powerup;

          const collision =
            powerup.x < player.x + player.width &&
            powerup.x + 20 > player.x &&
            powerup.y < player.y + player.height &&
            powerup.y + 20 > player.y;

          if (collision) {
            switch (powerup.type) {
              case 'speed':
                setPlayer((prev) => ({ ...prev, speedBoost: 5000 })); // 5 seconds
                break;
              case 'shield':
                setPlayer((prev) => ({ ...prev, shielded: 8000 })); // 8 seconds
                break;
              case 'points':
                setScore((prev) => prev + 200);
                break;
            }
            setScore((prev) => prev + 50); // Base powerup points
            return { ...powerup, collected: true };
          }
          return powerup;
        });
      });

      // Player vs Pursuer (Game Over)
      if (pursuer.catching && player.invulnerable <= 0 && player.shielded <= 0) {
        const collision =
          pursuer.x < player.x + player.width &&
          pursuer.x + pursuer.width > player.x &&
          pursuer.y < player.y + player.height &&
          pursuer.y + pursuer.height > player.y;
        if (collision) {
          setLives(0); // Instant game over when caught
        }
      }

      // Check game over
      if (lives <= 0) {
        setGameState('gameOver');
      }

      // Score for survival
      setScore((prev) => prev + 1);

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, stage, player, pursuer, lives, spawnObstacle, spawnPowerup]);

  // Auto-save progress
  useEffect(() => {
    if (gameState === 'playing' && score > 0 && score % 500 === 0) {
      autoSave({
        score,
        level: stage,
        progress: Math.min(1.0, distance / 10000),
        stats: { stage, distance, survivalTime: gameTime },
      }).catch(() => {}); // Ignore save errors during gameplay
    }
  }, [score, stage, distance, gameTime, autoSave, gameState]);

  // Save on game end
  useEffect(() => {
    if (gameState === 'gameOver') {
      saveOnExit({
        score,
        level: stage,
        progress: Math.min(1.0, distance / 10000),
        stats: {
          finalStage: stage,
          finalDistance: distance,
          survivalTime: gameTime,
          lastPlayed: Date.now(),
        },
      }).catch(console.error);
    }
  }, [gameState, score, stage, distance, gameTime, saveOnExit]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (gameState !== 'playing') return;

    // Draw background (moving pattern)
    ctx.fillStyle = '#2a2a2a';
    const bgOffset = (distance * 0.1) % 60;
    for (let x = -bgOffset; x < CANVAS_WIDTH; x += 60) {
      ctx.fillRect(x, 0, 30, CANVAS_HEIGHT);
    }

    // Draw ground
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Draw ground pattern
    ctx.fillStyle = '#4a4a4a';
    const groundOffset = (distance * 0.2) % 40;
    for (let x = -groundOffset; x < CANVAS_WIDTH; x += 40) {
      ctx.fillRect(x, GROUND_Y, 20, 10);
    }

    // Draw obstacles
    obstacles.forEach((obstacle) => {
      ctx.fillStyle = obstacle.type === 'high' ? '#8b0000' : '#654321';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

      // Obstacle warning/style
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      const symbols = { low: '▬', high: '▲', wide: '■' };
      ctx.fillText(symbols[obstacle.type], obstacle.x + 5, obstacle.y + 15);
    });

    // Draw powerups
    powerups.forEach((powerup) => {
      if (powerup.collected) return;

      const colors = {
        speed: '#00ff00',
        shield: '#0066ff',
        points: '#ffd700',
      };
      ctx.fillStyle = colors[powerup.type];
      ctx.fillRect(powerup.x, powerup.y, 20, 20);

      // Powerup glow effect
      ctx.shadowColor = colors[powerup.type];
      ctx.shadowBlur = 10;
      ctx.fillRect(powerup.x, powerup.y, 20, 20);
      ctx.shadowBlur = 0;

      const symbols = {
        speed: '',
        shield: '',
        points: '',
      };
      ctx.fillStyle = '#ffffff';
      ctx.fillText(symbols[powerup.type], powerup.x + 2, powerup.y + 15);
    });

    // Draw pursuer (menacing thighs)
    ctx.fillStyle = pursuer.catching ? '#ff0000' : '#800080';
    ctx.fillRect(pursuer.x, pursuer.y, pursuer.width, pursuer.height);

    // Pursuer effects
    if (pursuer.catching) {
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 20;
      ctx.fillRect(pursuer.x, pursuer.y, pursuer.width, pursuer.height);
      ctx.shadowBlur = 0;
    }

    // Pursuer symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.fillText('', pursuer.x + 25, pursuer.y + 50);

    // Draw player
    const playerColor =
      player.invulnerable > 0
        ? '#ff69b480'
        : player.shielded > 0
          ? '#00ffff'
          : player.speedBoost > 0
            ? '#ffff00'
            : '#ff69b4';
    ctx.fillStyle = playerColor;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Player effects
    if (player.shielded > 0) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
    }

    // Player symbol
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.fillText('‍️', player.x + 5, player.y + 25);

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText(`Score: ${score.toLocaleString()}`, 10, 30);
    ctx.fillText(`Stage: ${stage}`, 10, 55);
    ctx.fillText(`Distance: ${Math.floor(distance)}m`, 10, 80);
    ctx.fillText(`Lives: ${lives}`, 10, 105);

    // Debug info: spawn timers (development mode only)
    if (process.env.NODE_ENV === 'development') {
      ctx.fillStyle = '#888888';
      ctx.font = '12px monospace';
      ctx.fillText(`Obstacle: ${Math.max(0, Math.floor(obstacleSpawnTimer / 100))}`, 10, 125);
      ctx.fillText(`Powerup: ${Math.max(0, Math.floor(powerupSpawnTimer / 100))}`, 10, 140);
    }

    // Status effects
    if (player.speedBoost > 0) {
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`Speed Boost: ${Math.ceil(player.speedBoost / 1000)}s`, CANVAS_WIDTH - 200, 30);
    }
    if (player.shielded > 0) {
      ctx.fillStyle = '#00ffff';
      ctx.fillText(`Shield: ${Math.ceil(player.shielded / 1000)}s`, CANVAS_WIDTH - 200, 55);
    }

    // Pursuer distance warning
    const pursuerDistance = player.x - pursuer.x;
    if (pursuerDistance < 200) {
      ctx.fillStyle = pursuerDistance < 100 ? '#ff0000' : '#ffaa00';
      ctx.font = '16px monospace';
      ctx.fillText(`DANGER: ${Math.floor(pursuerDistance)}px`, CANVAS_WIDTH - 200, 80);
    }
  });

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000) % 60;
    const minutes = Math.floor(ms / 60000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (gameState === 'menu') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-red-900 to-black">
        <div className="text-center text-white">
          <div className="text-6xl mb-6">‍️</div>
          <h2 className="text-3xl font-bold mb-4">Thigh Colosseum</h2>
          <p className="text-gray-300 mb-8 max-w-md">
            Enter the arena. Win rounds and advance the bracket.
          </p>
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors text-lg font-semibold"
            >
              Enter Arena
            </button>
            <div className="text-sm text-gray-400 space-y-1">
              <p> A/D or Arrow Keys - Move Left/Right</p>
              <p>↑ W/Space/Up Arrow - Jump</p>
              <p> Collect powerups for advantages</p>
              <p> Avoid the pursuing thighs!</p>
              <p> Survive as long as possible</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 mt-6">
            "I didn't lose. Just ran out of health." – Edward Elric
          </p>
        </div>
      </div>
    );
  }

  if (gameState === 'paused') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black/80">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Paused</h2>
          <button
            onClick={() => setGameState('playing')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
          >
            Resume Chase
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-black">
        <div className="text-center text-white">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-3xl font-bold mb-4">Caught!</h2>
          <div className="space-y-2 mb-6">
            <div className="text-xl">Final Score: {score.toLocaleString()}</div>
            <div className="text-lg text-gray-300">Stage Reached: {stage}</div>
            <div className="text-lg text-gray-300">Distance Survived: {Math.floor(distance)}m</div>
            <div className="text-lg text-gray-300">Survival Time: {formatTime(gameTime)}</div>
          </div>
          <div className="space-x-4">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
            >
              Try Again
            </button>
            <a
              href="/mini-games"
              className="inline-block px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-colors"
            >
              Back to Hub
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="flex-1 bg-black border border-purple-500/30"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}
