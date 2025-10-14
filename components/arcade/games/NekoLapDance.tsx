/**
 * Neko Cosplay Character - Premium Interactive Experience
 * High-quality canvas rendering with detailed character design
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type GameProps } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
  type: 'heart' | 'sparkle' | 'note';
}

export default function NekoLapDance({ onComplete, _onFail, _duration }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  const [isPetting, setIsPetting] = useState(false);
  const [showNeko, setShowNeko] = useState(false);
  const [happiness, setHappiness] = useState(0);
  const [petCount, setPetCount] = useState(0);
  const [blushIntensity, setBlushIntensity] = useState(0);

  // Character animation states
  const [eyeExpression, setEyeExpression] = useState<'normal' | 'happy' | 'blush'>('normal');
  const [earWiggle, setEarWiggle] = useState(0);
  const [tailSway, setTailSway] = useState(0);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowNeko(true), 500);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (happiness >= 100) {
      setTimeout(() => onComplete(100 + petCount * 5, 18), 800);
    }
  }, [happiness, petCount, onComplete]);

  // Update expressions based on happiness
  useEffect(() => {
    if (happiness > 80) {
      setEyeExpression('blush');
      setBlushIntensity(1);
    } else if (happiness > 50) {
      setEyeExpression('happy');
      setBlushIntensity(0.6);
    } else {
      setEyeExpression('normal');
      setBlushIntensity(0.3);
    }
  }, [happiness]);

  const handlePet = useCallback(() => {
    if (isPetting || happiness >= 100) return;
    setIsPetting(true);
    setHappiness((prev) => Math.min(prev + 12, 100));
    setPetCount((prev) => prev + 1);

    // Spawn particles
    const canvas = canvasRef.current;
    if (canvas) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2 - 50;

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const speed = 2 + Math.random() * 2;
        particlesRef.current.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 1.0,
          size: 6 + Math.random() * 4,
          color: ['#ff9fbe', '#ffc7d9', '#ec4899'][Math.floor(Math.random() * 3)],
          type: Math.random() > 0.5 ? 'heart' : 'sparkle',
        });
      }
    }

    setTimeout(() => setIsPetting(false), 400);
  }, [isPetting, happiness]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePet();
      }
    },
    [handlePet],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Canvas rendering
  useEffect(() => {
    if (!canvasRef.current || !showNeko) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    let animationTime = 0;

    const render = () => {
      animationTime += 0.016;

      // Clear canvas with gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGradient.addColorStop(0, '#fce4ec');
      bgGradient.addColorStop(0.5, '#f8bbd0');
      bgGradient.addColorStop(1, '#f48fb1');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Animate ear wiggle and tail sway
      const wiggleAmount = isPetting
        ? Math.sin(animationTime * 20) * 5
        : Math.sin(animationTime * 2) * 2;
      const swayAmount = Math.sin(animationTime * 3) * 10;

      // Draw character
      drawNekoCharacter(ctx, centerX, centerY, wiggleAmount, swayAmount);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // Gravity
        particle.life -= 0.015;

        if (particle.life > 0) {
          ctx.save();
          ctx.globalAlpha = particle.life;

          if (particle.type === 'heart') {
            drawHeart(ctx, particle.x, particle.y, particle.size, particle.color);
          } else {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
          return true;
        }
        return false;
      });

      animationRef.current = requestAnimationFrame(render);
    };

    const drawNekoCharacter = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      wiggle: number,
      sway: number,
    ) => {
      // Body (torso in cosplay outfit)
      const bodyGradient = ctx.createLinearGradient(x - 60, y, x + 60, y + 100);
      bodyGradient.addColorStop(0, '#ec4899');
      bodyGradient.addColorStop(0.5, '#f472b6');
      bodyGradient.addColorStop(1, '#fb7185');

      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.ellipse(x, y + 40, 50, 70, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outfit details (frills)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(x - 40 + i * 20, y + 20, 8, 0, Math.PI, true);
        ctx.stroke();
      }

      // Head (skin tone)
      const headGradient = ctx.createRadialGradient(x, y - 40, 0, x, y - 40, 40);
      headGradient.addColorStop(0, '#ffc7d9');
      headGradient.addColorStop(1, '#ffb3c6');

      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.arc(x, y - 40, 40, 0, Math.PI * 2);
      ctx.fill();

      // Hair
      ctx.fillStyle = '#4a4a4a';
      ctx.beginPath();
      ctx.ellipse(x, y - 55, 42, 25, 0, 0, Math.PI, true);
      ctx.fill();

      // Cat ears (cosplay)
      drawCatEar(ctx, x - 25, y - 70, wiggle, '#ec4899');
      drawCatEar(ctx, x + 25, y - 70, -wiggle, '#ec4899');

      // Eyes
      drawEyes(ctx, x, y - 45, eyeExpression, isPetting);

      // Blush
      ctx.fillStyle = `rgba(255, 182, 193, ${blushIntensity * 0.6})`;
      ctx.beginPath();
      ctx.ellipse(x - 22, y - 30, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 22, y - 30, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mouth
      ctx.strokeStyle = '#d946ef';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (happiness > 70) {
        ctx.arc(x, y - 25, 12, 0.2, Math.PI - 0.2);
      } else {
        ctx.moveTo(x - 8, y - 25);
        ctx.lineTo(x + 8, y - 25);
      }
      ctx.stroke();

      // Cat tail (cosplay accessory)
      drawCatTail(ctx, x + 40, y + 60, sway);

      // Paw gesture when petting
      if (isPetting) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#ffc7d9';
        ctx.beginPath();
        ctx.ellipse(x - 55, y + 10, 12, 15, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    };

    const drawCatEar = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      wiggle: number,
      color: string,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((wiggle * Math.PI) / 180);

      // Outer ear
      const earGradient = ctx.createLinearGradient(-10, 0, 10, 0);
      earGradient.addColorStop(0, color);
      earGradient.addColorStop(1, '#f472b6');
      ctx.fillStyle = earGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-12, -25);
      ctx.lineTo(12, -25);
      ctx.closePath();
      ctx.fill();

      // Inner ear (pink)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.lineTo(-6, -18);
      ctx.lineTo(6, -18);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    };

    const drawEyes = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      expression: string,
      isPetting: boolean,
    ) => {
      const eyeScale = isPetting ? 1.1 : 1;

      ctx.save();

      if (expression === 'blush') {
        // Happy closed eyes
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x - 12, y, 6 * eyeScale, 0.3, Math.PI - 0.3);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + 12, y, 6 * eyeScale, 0.3, Math.PI - 0.3);
        ctx.stroke();
      } else if (expression === 'happy') {
        // Wide eyes with sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 12, y, 7 * eyeScale, 0, Math.PI * 2);
        ctx.arc(x + 12, y, 7 * eyeScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.arc(x - 12, y, 5 * eyeScale, 0, Math.PI * 2);
        ctx.arc(x + 12, y, 5 * eyeScale, 0, Math.PI * 2);
        ctx.fill();

        // Sparkle
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 14, y - 2, 2, 0, Math.PI * 2);
        ctx.arc(x + 10, y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Normal eyes
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - 12, y, 6 * eyeScale, 0, Math.PI * 2);
        ctx.arc(x + 12, y, 6 * eyeScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4a4a4a';
        ctx.beginPath();
        ctx.arc(x - 12, y, 4 * eyeScale, 0, Math.PI * 2);
        ctx.arc(x + 12, y, 4 * eyeScale, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const drawCatTail = (ctx: CanvasRenderingContext2D, x: number, y: number, sway: number) => {
      ctx.save();
      ctx.translate(x, y);

      const tailGradient = ctx.createLinearGradient(0, 0, sway, -60);
      tailGradient.addColorStop(0, '#ec4899');
      tailGradient.addColorStop(1, '#f472b6');

      ctx.fillStyle = tailGradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(sway / 2, -30, sway, -60);
      ctx.quadraticCurveTo(sway + 10, -55, sway, -50);
      ctx.quadraticCurveTo(sway / 2, -25, 5, 0);
      ctx.closePath();
      ctx.fill();

      // Tail tip (fluffy)
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.ellipse(sway, -60, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawHeart = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      color: string,
    ) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y + size / 4);
      ctx.bezierCurveTo(x, y, x - size / 2, y - size / 2, x - size / 2, y + size / 4);
      ctx.bezierCurveTo(x - size / 2, y + size, x, y + size * 1.3, x, y + size * 1.5);
      ctx.bezierCurveTo(x, y + size * 1.3, x + size / 2, y + size, x + size / 2, y + size / 4);
      ctx.bezierCurveTo(x + size / 2, y - size / 2, x, y, x, y + size / 4);
      ctx.fill();
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showNeko, isPetting, happiness, eyeExpression, blushIntensity]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full h-full cursor-pointer"
        onClick={handlePet}
        aria-label="Click or press Space to pet the neko character"
      />

      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
        {/* Happiness meter */}
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-pink-500/30">
          <div className="text-pink-200 text-sm mb-1">Affection</div>
          <div className="w-40 h-3 bg-black/50 rounded-full overflow-hidden border border-pink-500/20">
            <motion.div
              className="h-full bg-gradient-to-r from-pink-400 to-pink-600"
              initial={{ width: 0 }}
              animate={{ width: `${happiness}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Pet count */}
        <div className="bg-black/70 backdrop-blur-sm px-4 py-2 rounded-xl border border-pink-500/30">
          <div className="text-pink-200 text-sm">Pets: {petCount}</div>
        </div>
      </div>

      {/* Instructions */}
      <AnimatePresence>
        {happiness < 20 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-lg px-6 py-3 rounded-xl border border-pink-500/40 text-pink-200 text-sm"
          >
            Click or press SPACE to pet!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completion message */}
      <AnimatePresence>
        {happiness >= 100 && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-gradient-to-br from-pink-500/90 to-purple-500/90 backdrop-blur-xl border-2 border-pink-300/50 rounded-3xl p-8 text-center shadow-2xl">
              <div className="text-4xl font-bold text-white mb-2">Max Affection!</div>
              <div className="text-pink-100 text-lg">
                {petCount} pets • Bonus: +{petCount * 5} points
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
