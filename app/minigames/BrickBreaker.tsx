'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAchievements } from '@/lib/hooks/useAchievements';
import Image from 'next/image';

interface Brick {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  type: 'normal' | 'powerup' | 'golden' | 'boss';
  powerupType?: 'expand' | 'shrink' | 'multiball' | 'laser';
}

interface Ball {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'expand' | 'shrink' | 'multiball' | 'laser';
  speed: number;
}

// Use real images instead of emojis
const BRICK_IMAGES = {
  normal: '/assets/images/brick-normal.png',
  powerup: '/assets/images/brick-powerup.png',
  golden: '/assets/images/brick-golden.png',
  boss: '/assets/images/brick-boss.png',
};

const POWERUP_IMAGES = {
  expand: '/assets/images/powerup-expand.png',
  shrink: '/assets/images/powerup-shrink.png',
  multiball: '/assets/images/powerup-multiball.png',
  laser: '/assets/images/powerup-laser.png',
};

const WIDTH = 480;
const HEIGHT = 320;
const PADDLE_WIDTH = 80;
const PADDLE_HEIGHT = 12;
const BALL_RADIUS = 8;
const BRICK_ROWS = 4;
const BRICK_COLS = 7;
const BRICK_WIDTH = 60;
const BRICK_HEIGHT = 20;
const LIVES = 3;

const SFX = {
  paddle: 'https://cdn.fesliyanstudios.com/audio/Arcade%20Kid.mp3',
  brick: 'https://cdn.fesliyanstudios.com/audio/Retro%20Platforming.mp3',
  lose: 'https://cdn.fesliyanstudios.com/audio/Boss%20Time.mp3',
};

const BG_IMG = '/images/games/brickbreakbackground.jpg';
const BG_MUSIC = 'https://cdn.fesliyanstudios.com/audio/Retro%20Platforming.mp3';
const POWERUP_SFX = 'https://cdn.fesliyanstudios.com/audio/Boss%20Time.mp3';

function createBricks() {
  return Array.from({ length: BRICK_ROWS * BRICK_COLS }, (_, i) => ({
    x: (i % BRICK_COLS) * (BRICK_WIDTH + 8) + 16,
    y: Math.floor(i / BRICK_COLS) * (BRICK_HEIGHT + 8) + 32,
    hit: false,
  }));
}

export default function BrickBreaker() {
  const { unlockAchievement } = useAchievements();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [level, setLevel] = useState(1);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [paddleWidth, setPaddleWidth] = useState(100);
  const [paddleX, setPaddleX] = useState(350);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [laserMode, setLaserMode] = useState(false);
  const [laserCooldown, setLaserCooldown] = useState(0);

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const BRICK_PADDING = 5;

  // Initialize game
  const initializeGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setPaddleWidth(100);
    setPaddleX(350);
    setLaserMode(false);
    setLaserCooldown(0);
    setIsGameActive(true);
    setIsGameOver(false);

    // Initialize ball
    setBalls([
      {
        id: 1,
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT - 50,
        dx: 3,
        dy: -3,
        radius: BALL_RADIUS,
        speed: 3,
      },
    ]);

    // Initialize bricks
    const newBricks: Brick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        const x = col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING;
        const y = row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 50;

        let type: Brick['type'] = 'normal';
        let health = 1;
        let powerupType: PowerUp['type'] | undefined;

        // Add variety to bricks
        if (Math.random() < 0.1) {
          type = 'powerup';
          powerupType = ['expand', 'shrink', 'multiball', 'laser'][
            Math.floor(Math.random() * 4)
          ] as PowerUp['type'];
        } else if (Math.random() < 0.05) {
          type = 'golden';
          health = 3;
        } else if (row === 0 && col === Math.floor(BRICK_COLS / 2)) {
          type = 'boss';
          health = 5;
        }

        newBricks.push({
          id: row * BRICK_COLS + col,
          x,
          y,
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          health,
          maxHealth: health,
          type,
          powerupType,
        });
      }
    }
    setBricks(newBricks);
    setPowerUps([]);
  }, []);

  // Game loop
  useEffect(() => {
    if (!isGameActive || isGameOver) return;

    const gameLoop = () => {
      // Update ball positions
      setBalls(
        prev =>
          prev
            .map(ball => {
              let newX = ball.x + ball.dx;
              let newY = ball.y + ball.dy;
              let newDx = ball.dx;
              let newDy = ball.dy;

              // Wall collisions
              if (newX <= ball.radius || newX >= GAME_WIDTH - ball.radius) {
                newDx = -newDx;
              }
              if (newY <= ball.radius) {
                newDy = -newDy;
              }

              // Paddle collision
              if (
                newY >= GAME_HEIGHT - PADDLE_HEIGHT - ball.radius &&
                newX >= paddleX &&
                newX <= paddleX + paddleWidth
              ) {
                newDy = -Math.abs(newDy);
                // Angle based on where ball hits paddle
                const hitPos = (newX - paddleX) / paddleWidth;
                newDx = (hitPos - 0.5) * 6;
              }

              // Ball out of bounds
              if (newY > GAME_HEIGHT) {
                return null;
              }

              return { ...ball, x: newX, y: newY, dx: newDx, dy: newDy };
            })
            .filter(Boolean) as Ball[]
      );

      // Update power-ups
      setPowerUps(prev =>
        prev
          .map(powerup => ({
            ...powerup,
            y: powerup.y + 2,
          }))
          .filter(powerup => powerup.y < GAME_HEIGHT)
      );

      // Check power-up collisions
      setPowerUps(prev =>
        prev.filter(powerup => {
          if (
            powerup.y >= GAME_HEIGHT - PADDLE_HEIGHT &&
            powerup.x >= paddleX &&
            powerup.x <= paddleX + paddleWidth
          ) {
            // Activate power-up
            switch (powerup.type) {
              case 'expand':
                setPaddleWidth(prev => Math.min(prev + 20, 200));
                break;
              case 'shrink':
                setPaddleWidth(prev => Math.max(prev - 20, 60));
                break;
              case 'multiball':
                setBalls(prev => [
                  ...prev,
                  ...prev.map(ball => ({
                    ...ball,
                    id: Date.now() + Math.random(),
                    dx: ball.dx * (Math.random() > 0.5 ? 1 : -1),
                  })),
                ]);
                break;
              case 'laser':
                setLaserMode(true);
                setLaserCooldown(300);
                break;
            }
            return false;
          }
          return true;
        })
      );

      // Check brick collisions
      setBricks(prev =>
        prev
          .map(brick => {
            let newHealth = brick.health;
            let shouldDropPowerup = false;

            balls.forEach(ball => {
              if (
                ball.x >= brick.x &&
                ball.x <= brick.x + brick.width &&
                ball.y >= brick.y &&
                ball.y <= brick.y + brick.height
              ) {
                newHealth--;
                if (newHealth <= 0) {
                  setScore(
                    s => s + (brick.type === 'golden' ? 50 : brick.type === 'boss' ? 100 : 10)
                  );
                  if (brick.powerupType) {
                    setPowerUps(prev => [
                      ...prev,
                      {
                        id: Date.now(),
                        x: brick.x + brick.width / 2,
                        y: brick.y + brick.height,
                        type: brick.powerupType!,
                        speed: 2,
                      },
                    ]);
                  }
                  unlockAchievement('brick_breaker_destroyer');
                }
              }
            });

            return { ...brick, health: newHealth };
          })
          .filter(brick => brick.health > 0)
      );

      // Check for level completion
      if (bricks.every(brick => brick.health <= 0)) {
        setLevel(prev => prev + 1);
        unlockAchievement('brick_breaker_level_complete');
        initializeGame();
      }

      // Check for game over
      if (balls.length === 0) {
        setLives(prev => {
          if (prev <= 1) {
            setIsGameOver(true);
            setIsGameActive(false);
            if (score > 1000) unlockAchievement('brick_breaker_scorer');
            return 0;
          }
          return prev - 1;
        });

        // Reset ball
        setBalls([
          {
            id: Date.now(),
            x: GAME_WIDTH / 2,
            y: GAME_HEIGHT - 50,
            dx: 3,
            dy: -3,
            radius: BALL_RADIUS,
            speed: 3,
          },
        ]);
      }

      // Update laser cooldown
      if (laserMode && laserCooldown > 0) {
        setLaserCooldown(prev => prev - 1);
      }

      requestAnimationFrame(gameLoop);
    };

    const interval = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(interval);
  }, [
    isGameActive,
    isGameOver,
    balls,
    bricks,
    paddleX,
    paddleWidth,
    lives,
    score,
    unlockAchievement,
    initializeGame,
  ]);

  // Mouse movement
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isGameActive) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const newPaddleX = Math.max(0, Math.min(mouseX - paddleWidth / 2, GAME_WIDTH - paddleWidth));
      setPaddleX(newPaddleX);
    },
    [isGameActive, paddleWidth]
  );

  // Laser shooting
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!laserMode || laserCooldown > 0) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Shoot laser at clicked position
      setBricks(prev =>
        prev
          .map(brick => {
            if (
              clickX >= brick.x &&
              clickX <= brick.x + brick.width &&
              clickY >= brick.y &&
              clickY <= brick.y + brick.height
            ) {
              setScore(s => s + 5);
              return { ...brick, health: brick.health - 1 };
            }
            return brick;
          })
          .filter(brick => brick.health > 0)
      );

      setLaserCooldown(10);
    },
    [laserMode, laserCooldown]
  );

  // Draw game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw cherry blossoms in background
    ctx.fillStyle = 'rgba(255, 182, 193, 0.1)';
    for (let i = 0; i < 15; i++) {
      const x = (i * 60) % GAME_WIDTH;
      const y = (Date.now() * 0.05 + i * 40) % GAME_HEIGHT;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw bricks
    bricks.forEach(brick => {
      ctx.save();

      // Draw brick background
      switch (brick.type) {
        case 'normal':
          ctx.fillStyle = '#8B5CF6';
          break;
        case 'powerup':
          ctx.fillStyle = '#F59E0B';
          break;
        case 'golden':
          ctx.fillStyle = '#FFD700';
          break;
        case 'boss':
          ctx.fillStyle = '#EF4444';
          break;
      }

      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

      // Draw brick border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);

      // Draw health indicator
      if (brick.maxHealth > 1) {
        const healthPercent = brick.health / brick.maxHealth;
        ctx.fillStyle = `hsl(${healthPercent * 120}, 100%, 50%)`;
        ctx.fillRect(brick.x + 2, brick.y + 2, (brick.width - 4) * healthPercent, 4);
      }

      ctx.restore();
    });

    // Draw power-ups
    powerUps.forEach(powerup => {
      ctx.save();
      ctx.fillStyle = '#10B981';
      ctx.fillRect(powerup.x - 5, powerup.y - 5, 10, 10);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(powerup.x - 5, powerup.y - 5, 10, 10);
      ctx.restore();
    });

    // Draw balls
    balls.forEach(ball => {
      ctx.save();
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    });

    // Draw paddle
    ctx.save();
    ctx.fillStyle = laserMode ? '#EF4444' : '#3B82F6';
    ctx.fillRect(paddleX, GAME_HEIGHT - PADDLE_HEIGHT, paddleWidth, PADDLE_HEIGHT);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddleX, GAME_HEIGHT - PADDLE_HEIGHT, paddleWidth, PADDLE_HEIGHT);
    ctx.restore();

    // Draw UI
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
    ctx.fillText(`Lives: ${lives}`, 20, 60);
    ctx.fillText(`Level: ${level}`, 20, 90);

    if (laserMode) {
      ctx.fillStyle = laserCooldown > 0 ? '#6B7280' : '#EF4444';
      ctx.fillText(`LASER: ${laserCooldown > 0 ? 'COOLDOWN' : 'READY'}`, 20, 120);
    }
    ctx.restore();
  }, [
    bricks,
    powerUps,
    balls,
    paddleX,
    paddleWidth,
    score,
    lives,
    level,
    laserMode,
    laserCooldown,
  ]);

  const startGame = () => {
    initializeGame();
  };

  return (
    <div
      style={{
        background: '#181818',
        minHeight: '100vh',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* GameCube-style header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
          borderRadius: '12px',
          padding: '16px 24px',
          marginBottom: '24px',
          border: '2px solid #F59E0B',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              background: '#F59E0B',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#000',
            }}
          >
            GC
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Brick Breaker</h1>
          <div
            style={{
              fontSize: '12px',
              color: '#F59E0B',
              fontFamily: 'monospace',
            }}
          >
            GAME CUBE
          </div>
        </div>
      </div>

      <p style={{ fontSize: 18, marginBottom: 32, textAlign: 'center' }}>
        Break all the bricks! Collect power-ups for special abilities.
      </p>

      <div style={{ position: 'relative', marginBottom: 20 }}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          style={{
            border: '3px solid #8B5CF6',
            borderRadius: '12px',
            cursor: 'crosshair',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
          }}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />

        {!isGameActive && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.9)',
              padding: '24px',
              borderRadius: '12px',
              border: '2px solid #8B5CF6',
            }}
          >
            <p style={{ marginBottom: '16px', fontSize: '18px' }}>
              {isGameOver ? 'Game Over!' : 'Click to start!'}
            </p>
            <button
              onClick={startGame}
              style={{
                fontSize: '18px',
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              }}
            >
              {isGameOver ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <button
          onClick={startGame}
          style={{
            fontSize: '16px',
            padding: '10px 20px',
            background: '#10B981',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Restart Game
        </button>

        <button
          onClick={() => window.history.back()}
          style={{
            fontSize: '16px',
            padding: '10px 20px',
            background: '#6B7280',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Back to Menu
        </button>
      </div>

      <div style={{ fontSize: '14px', textAlign: 'center', maxWidth: '600px' }}>
        <p>
          <strong>How to play:</strong>
        </p>
        <p>• Move mouse to control paddle</p>
        <p>• Break all bricks to complete level</p>
        <p>• Collect power-ups: Expand, Shrink, Multiball, Laser</p>
        <p>• Golden bricks take multiple hits, Boss bricks are toughest!</p>
      </div>
    </div>
  );
}
