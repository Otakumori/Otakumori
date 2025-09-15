'use client';

import { useState, useEffect, useRef } from 'react';
import GlassPanel from '../GlassPanel';
import { t } from '../../lib/microcopy';

export default function Game404() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
    }> = [];

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const createParticle = () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
        color: `hsl(${Math.random() * 60 + 280}, 70%, 60%)`,
      };
    };

    const updateParticles = () => {
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        if (Math.random() < 0.01) {
          particles[index] = createParticle();
        }
      });
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
    };

    const animate = () => {
      updateParticles();
      drawParticles();
      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push(createParticle());
    }

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameOver(true);
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, gameOver]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Simple collision detection - add score if clicking near particles
    setScore((prev) => prev + 1);
  };

  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setTimeLeft(30);
    setIsPlaying(true);
  };

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setTimeLeft(30);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-3 gap-4">
        <GlassPanel className="p-4 text-center">
          <div className="text-2xl font-bold text-fuchsia-300">{score}</div>
          <div className="text-sm text-zinc-400">Score</div>
        </GlassPanel>
        <GlassPanel className="p-4 text-center">
          <div className="text-2xl font-bold text-white">{timeLeft}</div>
          <div className="text-sm text-zinc-400">Time Left</div>
        </GlassPanel>
        <GlassPanel className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">
            {isPlaying ? 'Playing' : gameOver ? 'Game Over' : 'Ready'}
          </div>
          <div className="text-sm text-zinc-400">Status</div>
        </GlassPanel>
      </div>

      {/* Game Canvas */}
      <GlassPanel className="p-4">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-white mb-2">Click the floating particles!</h2>
          <p className="text-zinc-400 text-sm">
            You have 30 seconds to collect as many as possible
          </p>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-96 rounded-xl bg-black/20 cursor-crosshair"
            style={{ minHeight: '384px' }}
          />

          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
              <button
                onClick={startGame}
                className="rounded-xl bg-fuchsia-500/90 px-8 py-4 text-lg font-semibold text-white hover:bg-fuchsia-500 transition-colors"
              >
                Start Game
              </button>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">Game Over!</div>
                <div className="text-lg text-fuchsia-300 mb-4">Final Score: {score}</div>
                <button
                  onClick={resetGame}
                  className="rounded-xl bg-fuchsia-500/90 px-6 py-3 text-white hover:bg-fuchsia-500 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
      </GlassPanel>

      {/* Instructions */}
      <GlassPanel className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How to Play</h3>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>• Click on the floating particles to collect them</li>
          <li>• Each particle gives you 1 point</li>
          <li>• You have 30 seconds to get the highest score</li>
          <li>• The particles move around randomly</li>
          <li>• Try to click as many as you can!</li>
        </ul>
      </GlassPanel>
    </div>
  );
}
