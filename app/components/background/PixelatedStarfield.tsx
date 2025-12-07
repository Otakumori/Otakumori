'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  twinklePhase: number;

export default function PixelatedStarfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create stars
    const createStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 8000); // Density based on screen size

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.1 + 0.02,
          opacity: Math.random() * 0.8 + 0.2,
          color: Math.random() > 0.7 ? '#FFB6C1' : Math.random() > 0.4 ? '#FFC0CB' : '#FFFFFF',
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }

      starsRef.current = stars;
    };

    createStars();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() * 0.001;

      starsRef.current.forEach((star) => {
        // Update position (slow drift)
        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = -star.size;
          star.x = Math.random() * canvas.width;
        }

        // Twinkling effect (slower)
        const twinkle = Math.sin(time * 0.5 + star.twinklePhase) * 0.3 + 0.7;
        const currentOpacity = star.opacity * twinkle;

        // Draw pixelated star
        ctx.fillStyle = star.color;
        ctx.globalAlpha = currentOpacity;

        // Create pixelated effect by drawing small squares
        const pixelSize = Math.max(1, Math.floor(star.size));
        const pixelX = Math.floor(star.x / pixelSize) * pixelSize;
        const pixelY = Math.floor(star.y / pixelSize) * pixelSize;

        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);

        // Add glow effect for larger stars
        if (star.size > 1.5) {
          ctx.globalAlpha = currentOpacity * 0.3;
          ctx.fillRect(pixelX - pixelSize, pixelY - pixelSize, pixelSize * 3, pixelSize * 3);
        }
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at center, #1a0f2b 0%, #0b0412 100%)',
        imageRendering: 'pixelated',
      }}
      aria-label="Animated pixelated starfield background"
    />
  );
}
