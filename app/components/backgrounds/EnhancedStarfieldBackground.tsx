'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Enhanced Starfield Background Component
 *
 * Pixel-style starfield with sakura pink shooting stars for home page.
 * Features:
 * - Pixel-style star rendering (1-2px squares, no anti-aliasing)
 * - Sakura pink shooting stars (occasional, ~1 every 8-10 seconds)
 * - Deep space background (dark gray, no purple)
 * - Subtle depth gradient
 * - Lower opacity so petals are clearly visible
 * - Performance optimized
 *
 * Key specifications:
 * - Stars: Pixel-style (1-2px squares), white/lavender
 * - Shooting stars: Sakura pink (#f3b7c2, #f4c1cb, #eaa4b4), ~1 every 8-10 seconds
 * - Background: Dark gray (#171819) with subtle gradient
 * - Opacity: Reduced so petals are clearly visible
 * - Density: 0.5 (reduced from 0.72)
 * - Speed: 0.4 (slower, more subtle)
 */

interface EnhancedStarfieldBackgroundProps {
  /**
   * Star density multiplier (0-1)
   * Default: 0.5 (reduced for petal visibility)
   */
  density?: number;
  /**
   * Animation speed multiplier (0-1)
   * Default: 0.4 (slower, more subtle)
   */
  speed?: number;
  /**
   * Custom className for styling
   */
  className?: string;
  /**
   * Z-index for layering
   */
  zIndex?: number;
}

interface PixelStar {
  x: number;
  y: number;
  size: number; // 1 or 2 pixels
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number; // 0-1, starts at 1, decreases to 0
  color: string; // Purple gradient color
}

export default function EnhancedStarfieldBackground({
  density = 0.5,
  speed = 0.4,
  className = '',
  zIndex = -11,
}: EnhancedStarfieldBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<PixelStar[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const lastShootingStarTimeRef = useRef<number>(0);

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Handle visibility change for performance
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Disable anti-aliasing for pixel-style rendering
    ctx.imageSmoothingEnabled = false;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let w = 0;
    let h = 0;

    const resizeCanvas = () => {
      w = Math.floor(window.innerWidth * DPR);
      h = Math.floor(window.innerHeight * DPR);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };

    resizeCanvas();

    // Initialize pixel stars
    const initStars = () => {
      const area = (w * h) / (DPR * DPR);
      const starCount = Math.max(
        100,
        Math.min(Math.round((area / 2000) * density), 800),
      );

      starsRef.current = [];
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() < 0.7 ? 1 : 2, // 70% are 1px, 30% are 2px
          opacity: 0.3 + Math.random() * 0.4, // 0.3-0.7 opacity (subtle)
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.002 + Math.random() * 0.003, // Slow twinkle
        });
      }
    };

    initStars();

    // Create a new shooting star
    const createShootingStar = (): ShootingStar => {
      const startX = Math.random() * w * 0.3; // Start from left side
      const startY = Math.random() * h * 0.3; // Start from top third
      const angle = Math.random() * Math.PI * 0.3 + Math.PI * 0.15; // 15-45 degrees
      const velocity = 2 + Math.random() * 3; // 2-5 pixels per frame

      // Choose sakura pink color
      const colors = ['#f3b7c2', '#f4c1cb', '#eaa4b4']; // Sakura pink variants
      const color = colors[Math.floor(Math.random() * colors.length)];

      return {
        x: startX,
        y: startY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        length: 30 + Math.random() * 40, // 30-70px trail
        opacity: 1,
        life: 1,
        color,
      };
    };

    let animationFrame: number;
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      if (!isVisible || prefersReducedMotion) {
        // Draw static frame for reduced motion
        ctx.fillStyle = '#171819'; // --om-bg-root
        ctx.fillRect(0, 0, w, h);

        // Draw static stars
        starsRef.current.forEach((star) => {
          ctx.fillStyle = `rgba(240, 225, 255, ${star.opacity * 0.5})`;
          ctx.fillRect(
            Math.floor(star.x / DPR) * DPR,
            Math.floor(star.y / DPR) * DPR,
            star.size * DPR,
            star.size * DPR,
          );
        });
        return;
      }

      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2); // Cap at 2x for lag
      lastTime = currentTime;

      // Clear canvas with dark gray background
      ctx.fillStyle = '#171819'; // --om-bg-root
      ctx.fillRect(0, 0, w, h);

      // Subtle depth gradient (very subtle, almost imperceptible)
      const gradient = ctx.createRadialGradient(
        w * 0.5,
        h * 0.5,
        Math.min(w, h) * 0.2,
        w * 0.5,
        h * 0.5,
        Math.max(w, h) * 0.8,
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(23, 24, 25, 0.3)'); // Very subtle dark gray tint at edges
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Update and draw pixel stars
      const time = currentTime * 0.001;
      starsRef.current.forEach((star) => {
        // Slow twinkle effect
        const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.2 + 0.8;
        const currentOpacity = star.opacity * twinkle * 0.6; // Further reduced for petal visibility

        // Draw pixel-style star (square, no anti-aliasing)
        ctx.fillStyle = `rgba(240, 225, 255, ${currentOpacity})`;
        const pixelX = Math.floor(star.x / DPR) * DPR;
        const pixelY = Math.floor(star.y / DPR) * DPR;
        const pixelSize = star.size * DPR;

        ctx.fillRect(pixelX, pixelY, pixelSize, pixelSize);
      });

      // Spawn shooting stars occasionally (~1 every 8-10 seconds)
      const timeSinceLastShootingStar = currentTime - lastShootingStarTimeRef.current;
      if (timeSinceLastShootingStar > 8000 + Math.random() * 2000) {
        // 8-10 seconds
        shootingStarsRef.current.push(createShootingStar());
        lastShootingStarTimeRef.current = currentTime;
      }

      // Update and draw shooting stars
      shootingStarsRef.current = shootingStarsRef.current.filter((shootingStar) => {
        // Update position
        shootingStar.x += shootingStar.vx * speed * deltaTime;
        shootingStar.y += shootingStar.vy * speed * deltaTime;
        shootingStar.life -= 0.02 * deltaTime; // Fade out over time

        // Remove if off-screen or faded out
        if (
          shootingStar.life <= 0 ||
          shootingStar.x > w + 100 ||
          shootingStar.y > h + 100
        ) {
          return false;
        }

        // Draw shooting star trail
        const alpha = shootingStar.opacity * shootingStar.life;
        const gradient = ctx.createLinearGradient(
          shootingStar.x - shootingStar.vx * shootingStar.length,
          shootingStar.y - shootingStar.vy * shootingStar.length,
          shootingStar.x,
          shootingStar.y,
        );

        // Parse color and create gradient
        const r = parseInt(shootingStar.color.slice(1, 3), 16);
        const g = parseInt(shootingStar.color.slice(3, 5), 16);
        const b = parseInt(shootingStar.color.slice(5, 7), 16);

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${alpha})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2 * DPR;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(
          shootingStar.x - shootingStar.vx * shootingStar.length,
          shootingStar.y - shootingStar.vy * shootingStar.length,
        );
        ctx.lineTo(shootingStar.x, shootingStar.y);
        ctx.stroke();

        // Draw bright head
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(shootingStar.x, shootingStar.y, 2 * DPR, 0, Math.PI * 2);
        ctx.fill();

        return true;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    const handleResize = () => {
      resizeCanvas();
      initStars();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleResize);
    };
  }, [density, speed, isVisible, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 h-screen w-screen pointer-events-none ${className}`}
      style={{ zIndex }}
    />
  );
}

