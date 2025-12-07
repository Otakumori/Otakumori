'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PetalPhysicsEngine, type PhysicsPetal } from '@/lib/physics/petal-physics';

interface AdvancedPetalSystemProps {
  maxPetals?: number;
  spawnRate?: number;
  windStrength?: number;
  enableCollisions?: boolean;
  enableMouseInteraction?: boolean;
  enableTrails?: boolean;
  className?: string;
  onPetalClick?: (petal: PhysicsPetal) => void;

export default function AdvancedPetalSystem({
  maxPetals = 100,
  spawnRate = 2,
  windStrength = 0.02,
  enableCollisions = true,
  enableMouseInteraction = true,
  enableTrails = true,
  className = '',
  onPetalClick,
}: AdvancedPetalSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PetalPhysicsEngine | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(true);
  const [debugMode, setDebugMode] = useState(false);

  // Initialize physics engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }

      if (engineRef.current) {
        engineRef.current.setBounds(rect.width, rect.height);
      } else {
        engineRef.current = new PetalPhysicsEngine(
          { width: rect.width, height: rect.height },
          maxPetals,
        );

        // Set initial wind
        engineRef.current.setWind(windStrength, { x: 1, y: 0.1 }, 0.01);

        // Add collision boxes for UI elements if enabled
        if (enableCollisions) {
          // Add some example collision boxes (you can customize these)
          engineRef.current.addCollisionBox({
            x: rect.width * 0.1,
            y: rect.height * 0.8,
            width: rect.width * 0.8,
            height: 50,
            type: 'bouncy',
            restitution: 0.8,
          });
        }
      }
    };

    updateCanvasSize();

    // Handle resize
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(canvas);

    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [maxPetals, windStrength, enableCollisions]);

  // Mouse interaction handler
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!enableMouseInteraction || !engineRef.current || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Create wind influence around mouse
      engineRef.current.setMousePosition(x, y, 0.2);
    },
    [enableMouseInteraction],
  );

  // Click handler for petal interaction
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (!engineRef.current || !canvasRef.current || !onPetalClick) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Find clicked petal
      const petals = engineRef.current.getPetals();
      for (const petal of petals) {
        const distance = Math.sqrt(
          Math.pow(petal.position.x - x, 2) + Math.pow(petal.position.y - y, 2),
        );

        if (distance < petal.scale * 15) {
          onPetalClick(petal);
          break;
        }
      }
    },
    [onPetalClick],
  );

  // Scroll-based wind effect
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (!engineRef.current) return;

      const scrollDelta = window.scrollY - lastScrollY;
      const windInfluence = Math.abs(scrollDelta) * 0.001;

      // Create wind based on scroll direction and speed
      engineRef.current.setWind(
        windStrength + windInfluence,
        { x: 1, y: scrollDelta > 0 ? 0.2 : -0.2 },
        0.02 + windInfluence,
      );

      lastScrollY = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [windStrength]);

  // Mouse event listeners
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, [handleMouseMove, handleClick]);

  // Animation loop
  useEffect(() => {
    if (!canvasRef.current || !engineRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (currentTime: number) => {
      if (!engineRef.current || !isVisible) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Spawn petals at specified rate
      if (currentTime - lastSpawnRef.current > 1000 / spawnRate) {
        const spawnX = (Math.random() * canvas.width) / window.devicePixelRatio;
        engineRef.current.spawnPetal(spawnX, -20);
        lastSpawnRef.current = currentTime;
      }

      // Update physics
      engineRef.current.update(deltaTime);

      // Clear canvas
      ctx.clearRect(
        0,
        0,
        canvas.width / window.devicePixelRatio,
        canvas.height / window.devicePixelRatio,
      );

      // Draw petals
      const petals = engineRef.current.getPetals();

      for (const petal of petals) {
        ctx.save();

        // Draw trail if enabled
        if (enableTrails && petal.trail.length > 1) {
          ctx.strokeStyle = petal.color + '40'; // Semi-transparent
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(petal.trail[0].x, petal.trail[0].y);

          for (let i = 1; i < petal.trail.length; i++) {
            const alpha = i / petal.trail.length;
            ctx.globalAlpha = alpha * 0.3;
            ctx.lineTo(petal.trail[i].x, petal.trail[i].y);
          }

          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Transform for rotation and scale
        ctx.translate(petal.position.x, petal.position.y);
        ctx.rotate(petal.rotation);
        ctx.scale(petal.scale, petal.scale);

        // Draw petal with collision highlighting
        if (petal.isColliding) {
          ctx.shadowColor = '#ff6b6b';
          ctx.shadowBlur = 10;
        }

        // Draw petal shape (cherry blossom style)
        ctx.fillStyle = petal.color;
        ctx.globalAlpha = Math.min(1, petal.energy);

        // Simple 5-petal flower shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * Math.PI * 2) / 5;
          const x = Math.cos(angle) * 8;
          const y = Math.sin(angle) * 8;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          // Add petal curves
          const nextAngle = ((i + 1) * Math.PI * 2) / 5;
          const controlX = Math.cos(angle + Math.PI / 5) * 12;
          const controlY = Math.sin(angle + Math.PI / 5) * 12;
          const endX = Math.cos(nextAngle) * 8;
          const endY = Math.sin(nextAngle) * 8;

          ctx.quadraticCurveTo(controlX, controlY, endX, endY);
        }

        ctx.closePath();
        ctx.fill();

        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        ctx.restore();
      }

      // Debug mode visualization
      if (debugMode && engineRef.current) {
        // Draw collision boxes
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        // This would draw collision boxes if we exposed them from the engine

        // Draw wind field visualization
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1;
        const gridSize = 50;
        for (let x = 0; x < canvas.width / window.devicePixelRatio; x += gridSize) {
          for (let y = 0; y < canvas.height / window.devicePixelRatio; y += gridSize) {
            // This would visualize wind vectors
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 10, y + 5); // Simplified wind direction
            ctx.stroke();
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, spawnRate, enableTrails, debugMode]);

  // Handle visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Keyboard shortcuts for debug mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'd') {
        event.preventDefault();
        setDebugMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none z-10 ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full pointer-events-auto"
        style={{
          mixBlendMode: 'screen',
          opacity: 0.8,
        }}
      />

      {debugMode && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-50">
          <div>
            Petals: {engineRef.current?.getPetals().length || 0}/{maxPetals}
          </div>
          <div>Wind: {windStrength}</div>
          <div>Debug Mode (Ctrl+D to toggle)</div>
        </div>
      )}
    </div>
  );
}
