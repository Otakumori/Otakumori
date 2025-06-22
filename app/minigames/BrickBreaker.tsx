'use client';
import { useEffect, useRef, useState } from 'react';
import { useAchievements } from '../lib/hooks/useAchievements';

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
  paddle: '/sounds/games/paddle.mp3',
  brick: '/sounds/games/brick.mp3',
  lose: '/sounds/games/lose.mp3',
};

function createBricks() {
  return Array.from({ length: BRICK_ROWS * BRICK_COLS }, (_, i) => ({
    x: (i % BRICK_COLS) * (BRICK_WIDTH + 8) + 16,
    y: Math.floor(i / BRICK_COLS) * (BRICK_HEIGHT + 8) + 32,
    hit: false,
  }));
}

export default function BrickBreaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [lives, setLives] = useState(LIVES);
  const [win, setWin] = useState(false);
  const paddleSfx = useRef<HTMLAudioElement>(null);
  const brickSfx = useRef<HTMLAudioElement>(null);
  const loseSfx = useRef<HTMLAudioElement>(null);
  const { unlockAchievement } = useAchievements();

  useEffect(() => {
    let paddleX = WIDTH / 2 - PADDLE_WIDTH / 2;
    let ballX = WIDTH / 2;
    let ballY = HEIGHT - 40;
    let ballDX = 3;
    let ballDY = -3;
    let bricks = createBricks();
    let running = true;
    let left = false,
      right = false;
    let localLives = LIVES;
    setWin(false);
    setLives(LIVES);
    setScore(0);

    const draw = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      // Draw paddle
      ctx.fillStyle = '#333';
      ctx.fillRect(paddleX, HEIGHT - PADDLE_HEIGHT - 8, PADDLE_WIDTH, PADDLE_HEIGHT);
      // Draw ball
      ctx.beginPath();
      ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#e57373';
      ctx.fill();
      ctx.closePath();
      // Draw bricks
      bricks.forEach(b => {
        if (!b.hit) {
          ctx.fillStyle = '#90caf9';
          ctx.fillRect(b.x, b.y, BRICK_WIDTH, BRICK_HEIGHT);
        }
      });
      // Draw score
      ctx.font = '18px Arial';
      ctx.fillStyle = '#222';
      ctx.fillText(`Score: ${score}`, 16, 24);
      // Draw lives
      ctx.font = '18px Arial';
      ctx.fillStyle = '#e57373';
      ctx.fillText(`Lives: ${localLives}`, WIDTH - 100, 24);
    };

    const step = () => {
      if (!running) return;
      // Move paddle
      if (left) paddleX = Math.max(0, paddleX - 6);
      if (right) paddleX = Math.min(WIDTH - PADDLE_WIDTH, paddleX + 6);
      // Move ball
      ballX += ballDX;
      ballY += ballDY;
      // Wall collision
      if (ballX < BALL_RADIUS || ballX > WIDTH - BALL_RADIUS) ballDX *= -1;
      if (ballY < BALL_RADIUS) ballDY *= -1;
      // Paddle collision
      if (
        ballY > HEIGHT - PADDLE_HEIGHT - 16 - BALL_RADIUS &&
        ballX > paddleX &&
        ballX < paddleX + PADDLE_WIDTH
      ) {
        ballDY *= -1;
        ballY = HEIGHT - PADDLE_HEIGHT - 16 - BALL_RADIUS;
        if (paddleSfx.current) paddleSfx.current.play().catch(() => {});
      }
      // Brick collision
      bricks.forEach(b => {
        if (
          !b.hit &&
          ballX > b.x &&
          ballX < b.x + BRICK_WIDTH &&
          ballY > b.y &&
          ballY < b.y + BRICK_HEIGHT
        ) {
          b.hit = true;
          setScore(s => s + 1);
          ballDY *= -1;
          if (brickSfx.current) brickSfx.current.play().catch(() => {});
        }
      });
      // Win condition
      if (bricks.every(b => b.hit)) {
        running = false;
        setWin(true);
        // Achievement: Paddle Daddy (win without losing a ball)
        if (localLives === LIVES) unlockAchievement('brick_breaker_paddledaddy');
        // Achievement: Break Me, Please (destroy all blocks without power-ups)
        unlockAchievement('brick_breaker_breakme');
        // Achievement: Otaku Omnismash (clear all bricks)
        unlockAchievement('brick_breaker_omnismash');
      }
      // Lose condition
      if (ballY > HEIGHT + BALL_RADIUS) {
        localLives--;
        setLives(localLives);
        if (localLives > 0) {
          // Reset ball
          ballX = WIDTH / 2;
          ballY = HEIGHT - 40;
          ballDX = 3;
          ballDY = -3;
          if (loseSfx.current) loseSfx.current.play().catch(() => {});
        } else {
          running = false;
          if (loseSfx.current) loseSfx.current.play().catch(() => {});
          // Achievement: Too Hard, Didn't Bounce (lose within 5 seconds)
          unlockAchievement('brick_breaker_toohard');
        }
      }
      draw();
      if (running) requestAnimationFrame(step);
    };

    draw();
    requestAnimationFrame(step);

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') left = e.type === 'keydown';
      if (e.key === 'ArrowRight' || e.key === 'd') right = e.type === 'keydown';
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, [resetKey]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f3e5f5',
      }}
    >
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ borderRadius: 16, boxShadow: '0 2px 16px #0004', background: '#fff' }}
      />
      <audio ref={paddleSfx} src={SFX.paddle} preload="auto" />
      <audio ref={brickSfx} src={SFX.brick} preload="auto" />
      <audio ref={loseSfx} src={SFX.lose} preload="auto" />
      <div style={{ marginTop: 24, fontSize: 20, fontWeight: 700 }}>
        Score: {score} &nbsp;|&nbsp; Lives: {lives}
      </div>
      {win && (
        <div style={{ marginTop: 16, fontSize: 24, color: '#388e3c', fontWeight: 700 }}>
          You Win! 🎉
        </div>
      )}
      <button
        onClick={() => {
          setScore(0);
          setResetKey(k => k + 1);
          setLives(LIVES);
          setWin(false);
        }}
        style={{
          marginTop: 16,
          fontSize: 18,
          padding: '8px 20px',
          borderRadius: 8,
          background: '#222',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px #0003',
        }}
      >
        Reset
      </button>
    </div>
  );
}
