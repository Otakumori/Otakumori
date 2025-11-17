'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Physics-based Cherry Blossom Petals
 * 
 * Features:
 * - Realistic physics (gravity, wind, rotation)
 * - Clickable/collectible (invisible mechanic - no UI feedback)
 * - Procedurally generated cherry blossom petal shapes
 * - Smooth animations and natural movement
 * - No user textures - pure CSS/Canvas rendering
 */

interface Petal {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  opacity: number;
  color: string;
  collected: boolean;
}

interface PhysicsCherryPetalsProps {
  density?: number; // Petals per second (default: 2)
  onCollect?: (petalId: number) => void; // Silent collection callback
}

const GRAVITY = 0.15;
const WIND_STRENGTH = 0.3;
const AIR_RESISTANCE = 0.98;
const ROTATION_SPEED_MIN = 0.5;
const ROTATION_SPEED_MAX = 2.0;

// Cherry blossom colors (pink variations)
const PETAL_COLORS = [
  '#FFB6C1', // Light pink
  '#FFC0CB', // Pink
  '#FFB3D9', // Light hot pink
  '#FF91A4', // Pink salmon
  '#FFA0B4', // Pink rose
  '#FFB8D4', // Light pink
];

export default function PhysicsCherryPetals({ 
  density = 2, 
  onCollect 
}: PhysicsCherryPetalsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const lastSpawnTimeRef = useRef(0);
  const petalIdCounterRef = useRef(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Create new petal
  const createPetal = useCallback((): Petal => {
    const id = petalIdCounterRef.current++;
    return {
      id,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
      y: -20,
      vx: (Math.random() - 0.5) * 0.8,
      vy: Math.random() * 0.5 + 0.3,
      rotation: Math.random() * 360,
      rotationSpeed: ROTATION_SPEED_MIN + Math.random() * (ROTATION_SPEED_MAX - ROTATION_SPEED_MIN),
      scale: 0.5 + Math.random() * 0.5, // 0.5 to 1.0
      opacity: 0,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      collected: false,
    };
  }, []);

  // Update petal physics
  const updatePetal = useCallback((petal: Petal, time: number, deltaTime: number): Petal => {
    // Apply gravity
    const newVy = petal.vy + GRAVITY * deltaTime;

    // Apply wind (sine wave for natural sway)
    const windEffect = Math.sin((time * 0.001 + petal.id * 0.1) * 2) * WIND_STRENGTH;
    const newVx = petal.vx * AIR_RESISTANCE + windEffect * deltaTime;

    // Update position
    const newX = petal.x + newVx;
    const newY = petal.y + newVy;

    // Update rotation
    const newRotation = petal.rotation + petal.rotationSpeed;

    // Fade in at top
    let newOpacity = petal.opacity;
    if (petal.y < 50) {
      newOpacity = Math.min(1, petal.opacity + 0.05);
    } else if (typeof window !== 'undefined' && petal.y > window.innerHeight - 100) {
      newOpacity = Math.max(0, petal.opacity - 0.03);
    }

    return {
      ...petal,
      vx: newVx,
      vy: newVy,
      x: newX,
      y: newY,
      rotation: newRotation,
      opacity: newOpacity,
    };
  }, []);

  // Draw petal shape (cherry blossom petal - 5 petals)
  const drawPetal = useCallback((ctx: CanvasRenderingContext2D, petal: Petal) => {
    ctx.save();
    ctx.translate(petal.x, petal.y);
    ctx.rotate((petal.rotation * Math.PI) / 180);
    ctx.scale(petal.scale, petal.scale);
    ctx.globalAlpha = petal.opacity;

    // Draw cherry blossom petal shape (simplified 5-petal flower)
    const size = 8; // Base size
    ctx.fillStyle = petal.color;
    ctx.strokeStyle = petal.color;
    ctx.lineWidth = 0.5;

    // Draw petal shape (ellipse-based)
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.6, size * 1.2, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Add subtle highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.3, size * 0.3, size * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }, []);

  // Handle click (silent collection)
  const handleClick = useCallback((e: MouseEvent) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if click is on any petal
    petalsRef.current.forEach((petal) => {
      if (petal.collected) return;

      const dx = clickX - petal.x;
      const dy = clickY - petal.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const petalRadius = 12 * petal.scale; // Clickable radius

      if (distance < petalRadius) {
        petal.collected = true;
        // Silent collection - no visual feedback
        if (onCollect) {
          onCollect(petal.id);
        }
      }
    });
  }, [onCollect]);

  // Animation loop
  useEffect(() => {
    if (prefersReducedMotion) return;

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

    // Add click listener
    canvas.addEventListener('click', handleClick);

    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2); // Cap at 2x normal speed
      lastTime = currentTime;

      // Spawn new petals
      const spawnInterval = 1000 / density; // milliseconds between spawns
      if (currentTime - lastSpawnTimeRef.current > spawnInterval) {
        petalsRef.current.push(createPetal());
        lastSpawnTimeRef.current = currentTime;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw petals
      petalsRef.current = petalsRef.current
        .map((petal) => updatePetal(petal, currentTime, deltaTime))
        .filter((petal) => {
          // Remove if off screen or collected
          if (petal.collected) return false;
          if (petal.y > canvas.height + 50) return false;
          if (petal.x < -50 || petal.x > canvas.width + 50) return false;
          if (petal.opacity <= 0 && petal.y > 100) return false;
          return true;
        });

      // Draw all petals
      petalsRef.current.forEach((petal) => {
        if (!petal.collected) {
          drawPetal(ctx, petal);
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('click', handleClick);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [prefersReducedMotion, createPetal, updatePetal, drawPetal, handleClick, density, onCollect]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-5]"
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}

