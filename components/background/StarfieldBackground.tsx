'use client';

import { useEffect, useRef, useState } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
}

interface StarfieldBackgroundProps {
  className?: string;
}

export default function StarfieldBackground({ className = '' }: StarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  // Check for reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || typeof window === 'undefined' || reducedMotion) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate stars
    const generateStars = () => {
      const stars: Star[] = [];
      const starCount = Math.floor((canvas.width * canvas.height) / 8000); // Pixel-style density

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() < 0.7 ? 1 : 2, // Most stars are 1px, some are 2px
          opacity: Math.random() * 0.5 + 0.3,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
      return stars;
    };

    starsRef.current = generateStars();

    // Generate shooting star occasionally
    const generateShootingStar = () => {
      if (Math.random() < 0.003) {
        // ~0.3% chance per frame (roughly 1 every 10-15 seconds at 60fps)
        shootingStarsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height * 0.5), // Top half of screen
          length: Math.random() * 60 + 40,
          speed: Math.random() * 3 + 2,
          angle: Math.random() * Math.PI * 0.25 + Math.PI * 0.125, // Diagonal down-right
          opacity: 1,
        });
      }
    };

    // Animation loop
    let _time = 0;
    const animate = () => {
      if (!ctx || !canvas) return;

      _time += 0.01;

      // Clear canvas
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background - very dark purple/black for starry night
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#000000'); // Pure black at top
      gradient.addColorStop(0.2, '#0a0a0a'); // Very dark
      gradient.addColorStop(0.5, '#1a0b2e'); // Deep dark purple
      gradient.addColorStop(0.8, '#0f0f23'); // Very dark purple-blue
      gradient.addColorStop(1, '#000000'); // Pure black at bottom
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw twinkling stars
      starsRef.current.forEach((star) => {
        const finalOpacity = star.opacity;

        ctx.fillStyle =
          Math.random() < 0.1
            ? `rgba(236, 72, 153, ${finalOpacity})` // Pink stars (10%)
            : `rgba(255, 255, 255, ${finalOpacity})`; // White stars (90%)

        // Pixel-perfect rendering
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
      });

      // Update and draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((star) => {
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.01;

        if (star.opacity <= 0) return false;

        // Draw shooting star trail
        const gradient = ctx.createLinearGradient(
          star.x,
          star.y,
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length,
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${star.opacity})`);
        gradient.addColorStop(0.5, `rgba(236, 72, 153, ${star.opacity * 0.6})`); // Pink trail
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(
          star.x - Math.cos(star.angle) * star.length,
          star.y - Math.sin(star.angle) * star.length,
        );
        ctx.stroke();

        return true;
      });

      // Occasionally generate new shooting star
      generateShootingStar();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [reducedMotion]);

  // Render static gradient if reduced motion is preferred
  if (reducedMotion) {
    return <div className={`${className} bg-gradient-to-b from-black via-purple-950 to-black`} />;
  }

  return <canvas ref={canvasRef} className={className} />;
}
