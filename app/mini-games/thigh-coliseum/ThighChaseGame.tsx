'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useGameSave } from '../_shared/SaveSystem';
import { RUNTIME_FLAGS } from '@/constants.client';
import { PhysicsCharacterRenderer } from '../_shared/PhysicsCharacterRenderer';
import { createGlowEffect } from '../_shared/enhancedTextures';

interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'low' | 'high' | 'wide';
  speed: number;
  warningTime: number; // Time remaining for warning (0 = no warning, >0 = warning active)
  }

interface Powerup {
  id: number;
  x: number;
  y: number;
  type: 'speed' | 'shield' | 'points';
  collected: boolean;
  }

export default function ThighChaseGame({
  onScoreChange,
  onLivesChange,
  onStageChange,
  onGameEnd,
}: {
  onScoreChange?: (score: number) => void;
  onLivesChange?: (lives: number) => void;
  onStageChange?: (stage: number) => void;
  onGameEnd?: (score: number, didWin: boolean) => void;
} = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const keysRef = useRef<Set<string>>(new Set());

  // Physics renderers
  const playerRendererRef = useRef<PhysicsCharacterRenderer | null>(null);
  const pursuerRendererRef = useRef<PhysicsCharacterRenderer | null>(null);

  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [stage, setStage] = useState(1);
  const [lives, setLives] = useState(3);
  const [cameraX, setCameraX] = useState(0); // Camera position for following player
  const [lastMilestoneDistance, setLastMilestoneDistance] = useState(0);
  const [lastMilestoneStage, setLastMilestoneStage] = useState(1);

  // Notify parent of state changes
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(score);
    }
  }, [score, onScoreChange]);

  useEffect(() => {
    if (onLivesChange) {
      onLivesChange(lives);
    }
  }, [lives, onLivesChange]);

  useEffect(() => {
    if (onStageChange) {
      onStageChange(stage);
    }
  }, [stage, onStageChange]);

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

    // Initialize pursuer renderer (succubus-style for thighs theme)
    if (!pursuerRendererRef.current) {
      pursuerRendererRef.current = new PhysicsCharacterRenderer(ctx, 'succubus', {
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
      if (pursuerRendererRef.current) {
        pursuerRendererRef.current.dispose();
        pursuerRendererRef.current = null;
      }
    };
  }, []);

  // Game constants (REBALANCED for fairness)
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const GROUND_Y = 400;
  const GRAVITY = 0.8;
  const JUMP_FORCE = -15;
  const BASE_SPEED = 3; // Reduced from 4 for slower gameplay

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setDistance(0);
    setStage(1);
    setLives(5); // Increased from 3 for better survivability
    setGameTime(0);
    setCameraX(0);
    setLastMilestoneDistance(0);
    setLastMilestoneStage(1);
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
        // Apply physics impact on jump
        if (playerRendererRef.current) {
          playerRendererRef.current.applyImpact({ x: 0, y: -3 }, 'chest');
        }
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
    const speed = BASE_SPEED + stage * 0.3; // Reduced from 0.5 for gentler difficulty curve

    const newObstacle: Obstacle = {
      id: nextObstacleId,
      x: CANVAS_WIDTH + 50,
      y: template.y,
      width: template.width,
      height: template.height,
      type: template.type,
      speed,
      warningTime: 800, // 800ms warning before obstacle reaches player
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
        const newDistance = prev + (BASE_SPEED + stage * 0.3); // Match reduced speed scaling

        // Stage progression every 1500 distance units (was 1000, slower progression)
        const newStage = Math.floor(newDistance / 1500) + 1;
        if (newStage > stage) {
          setStage(newStage);
        }

        // Milestone rewards - every 500m
        const milestoneDistance = Math.floor(newDistance / 500);
        const lastMilestone = Math.floor(lastMilestoneDistance / 500);
        if (milestoneDistance > lastMilestone) {
          setLastMilestoneDistance(newDistance);
          // Award milestone petals (handled in page component via onStageChange)
          setScore((s) => s + milestoneDistance * 100); // Bonus score
        }

        return newDistance;
      });

      // Stage milestone rewards
      if (stage > lastMilestoneStage) {
        setLastMilestoneStage(stage);
        // Award stage milestone petals (handled in page component)
        setScore((s) => s + stage * 200); // Bonus score for stage milestone
      }

      // Camera following player with smooth interpolation
      setCameraX((prev) => {
        const targetX = Math.max(0, player.x - CANVAS_WIDTH / 3); // Keep player in left third of screen
        return prev + (targetX - prev) * 0.1; // Smooth camera follow
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
          if (!prev.onGround) {
            // Apply physics impact on landing
            if (playerRendererRef.current) {
              playerRendererRef.current.applyImpact({ x: 0, y: 2 }, 'hips');
            }
          }
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

        const updatedPlayer = {
          ...prev,
          x: newX,
          y: newY,
          velocityY: newVelocityY,
          onGround: newOnGround,
          invulnerable: newInvulnerable,
          shielded: newShielded,
          speedBoost: newSpeedBoost,
        };

        // Update player physics
        if (playerRendererRef.current) {
          const velocityX = (newX - prev.x) / (deltaTime / 1000);
          const velocityY = newVelocityY;
          playerRendererRef.current.update(
            deltaTime / 1000,
            { x: velocityX, y: velocityY },
            { x: newX, y: newY },
          );
        }

        return updatedPlayer;
      });

      // Update pursuer (always getting closer - REBALANCED)
      setPursuer((prev) => {
        const targetDistance = 150; // Ideal distance behind player
        const currentDistance = player.x - prev.x;
        let newSpeed = prev.speed + 0.005; // Reduced from 0.01 (half speed increase)

        if (currentDistance < 50) {
          // Too close - catching the player
          return { ...prev, catching: true, speed: newSpeed };
        } else if (currentDistance > targetDistance) {
          // Too far - speed up (but not as dramatically)
          newSpeed += 0.2; // Reduced from 0.5 for fairer catch-up
        }

        const updatedPursuer = {
          ...prev,
          x: prev.x + newSpeed,
          speed: newSpeed,
          catching: false,
        };

        // Update pursuer physics
        if (pursuerRendererRef.current) {
          const velocityX = newSpeed;
          const velocityY = 0;
          pursuerRendererRef.current.update(
            deltaTime / 1000,
            { x: velocityX, y: velocityY },
            { x: updatedPursuer.x, y: prev.y },
          );
        }

        return updatedPursuer;
      });

      // Spawn obstacles (REBALANCED spawn rate)
      setObstacleSpawnTimer((prev) => {
        const spawnRate = Math.max(1200, 2000 - stage * 80); // Increased minimum from 800ms, slower scaling
        if (prev <= 0) {
          if (Math.random() < 0.7) spawnObstacle();
          return spawnRate;
        }
        return prev - deltaTime;
      });

      // Spawn powerups (REBALANCED for more frequent help)
      setPowerupSpawnTimer((prev) => {
        if (prev <= 0) {
          if (Math.random() < 0.6) spawnPowerup(); // Increased from 0.3 (30%) to 0.6 (60%)
          return 4000; // Every 4 seconds chance (was 5000)
        }
        return prev - deltaTime;
      });

      // Update obstacles with warnings
      setObstacles((prev) =>
        prev
          .map((obstacle) => {
            const newX = obstacle.x - obstacle.speed;
            const distanceToPlayer = newX - player.x;
            const timeToCollision = distanceToPlayer / obstacle.speed; // Approximate time until collision

            // Update warning time based on distance to player
            let newWarningTime = obstacle.warningTime;
            if (distanceToPlayer < 400 && distanceToPlayer > 0) {
              // Show warning when obstacle is approaching (400px away)
              newWarningTime = Math.max(0, timeToCollision * 16); // Convert to ms (deltaTime is 16ms)
            } else {
              newWarningTime = 0;
            }

            return { ...obstacle, x: newX, warningTime: newWarningTime };
          })
          .filter((obstacle) => obstacle.x > -100),
      );

      // Update powerups (match rebalanced speed)
      setPowerups((prev) =>
        prev
          .map((powerup) => ({ ...powerup, x: powerup.x - (BASE_SPEED + stage * 0.3) })) // Match reduced scaling
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
              // Apply physics impact on obstacle hit
              if (playerRendererRef.current) {
                const impactForce = {
                  x: obstacle.x < player.x ? -4 : 4,
                  y: -2,
                };
                playerRendererRef.current.applyImpact(impactForce, 'chest');
              }
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
        // Notify parent of game over
        if (onGameEnd) {
          onGameEnd(score, false); // didWin = false (lives reached 0)
        }
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

    // Apply camera transform
    ctx.save();
    ctx.translate(-cameraX, 0);

    // Draw background (moving pattern) - Enhanced
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#1a0a1a');
    bgGradient.addColorStop(0.5, '#2a1a2a');
    bgGradient.addColorStop(1, '#1a0a1a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(cameraX, 0, CANVAS_WIDTH + 200, CANVAS_HEIGHT);

    // Moving pattern overlay
    ctx.fillStyle = '#2a2a2a';
    const bgOffset = (distance * 0.1) % 60;
    for (let x = -bgOffset + cameraX; x < CANVAS_WIDTH + cameraX; x += 60) {
      ctx.fillRect(x, 0, 30, CANVAS_HEIGHT);
    }

    // Draw ground
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(cameraX, GROUND_Y, CANVAS_WIDTH + 200, CANVAS_HEIGHT - GROUND_Y);

    // Draw ground pattern
    ctx.fillStyle = '#4a4a4a';
    const groundOffset = (distance * 0.2) % 40;
    for (let x = -groundOffset + cameraX; x < CANVAS_WIDTH + cameraX; x += 40) {
      ctx.fillRect(x, GROUND_Y, 20, 10);
    }

    // Draw obstacles with warnings
    obstacles.forEach((obstacle) => {
      // Warning glow effect when approaching
      if (obstacle.warningTime > 0) {
        const warningIntensity = Math.min(1, obstacle.warningTime / 400); // Fade as it gets closer
        const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;

        ctx.save();
        ctx.globalAlpha = warningIntensity * pulse * 0.5;
        ctx.fillStyle = '#ff4444';
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff4444';
        ctx.fillRect(obstacle.x - 10, obstacle.y - 10, obstacle.width + 20, obstacle.height + 20);
        ctx.restore();

        // Warning indicator above obstacle
        ctx.save();
        ctx.globalAlpha = warningIntensity;
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('!', obstacle.x + obstacle.width / 2, obstacle.y - 15);
        ctx.restore();
      }

      ctx.fillStyle = obstacle.type === 'high' ? '#8b0000' : '#654321';
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

      // Obstacle warning/style
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
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

      // Powerup glow effect - Enhanced
      createGlowEffect(ctx, powerup.x + 10, powerup.y + 10, 15, colors[powerup.type], 0.5);
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

    // Draw pursuer with physics
    if (pursuerRendererRef.current) {
      pursuerRendererRef.current.render(
        pursuer.x + pursuer.width / 2,
        pursuer.y + pursuer.height / 2,
        'right',
      );

      // Pursuer effects overlay
      if (pursuer.catching) {
        createGlowEffect(
          ctx,
          pursuer.x + pursuer.width / 2,
          pursuer.y + pursuer.height / 2,
          50,
          '#ff0000',
          0.5,
        );
      }
    } else {
      // Fallback rendering
      ctx.fillStyle = pursuer.catching ? '#ff0000' : '#800080';
      ctx.fillRect(pursuer.x, pursuer.y, pursuer.width, pursuer.height);
      if (pursuer.catching) {
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.fillRect(pursuer.x, pursuer.y, pursuer.width, pursuer.height);
        ctx.shadowBlur = 0;
      }
    }

    // Draw player with physics
    if (playerRendererRef.current) {
      playerRendererRef.current.render(
        player.x + player.width / 2,
        player.y + player.height / 2,
        'right',
      );

      // Player effects overlay
      if (player.invulnerable > 0) {
        ctx.save();
        ctx.globalAlpha = Math.sin(Date.now() / 50) * 0.5 + 0.5;
        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 2;
        ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
        ctx.restore();
      }

      if (player.shielded > 0) {
        createGlowEffect(
          ctx,
          player.x + player.width / 2,
          player.y + player.height / 2,
          30,
          '#00ffff',
          0.4,
        );
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
      }

      if (player.speedBoost > 0) {
        createGlowEffect(
          ctx,
          player.x + player.width / 2,
          player.y + player.height / 2,
          25,
          '#ffff00',
          0.3,
        );
      }
    } else {
      // Fallback rendering
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
      if (player.shielded > 0) {
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
      }
    }

    ctx.restore(); // Restore camera transform

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.fillText(`Score: ${score.toLocaleString()}`, 10, 30);
    ctx.fillText(`Stage: ${stage}`, 10, 55);
    ctx.fillText(`Distance: ${Math.floor(distance)}m`, 10, 80);
    ctx.fillText(`Lives: ${lives}`, 10, 105);

    // Debug info: spawn timers (development mode only)
    if (RUNTIME_FLAGS.isDev) {
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
          <div className="text-6xl mb-6">‍<span role="img" aria-label="emoji">️</span></div>
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
