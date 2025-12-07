'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  }

interface PetalParticleBurstProps {
  trigger: number; // Increment this to trigger burst
  className?: string;
}

/**
 * Canvas-based particle burst animation for petal collection
 * Shows celebratory particles when petals are collected
 */
export default function PetalParticleBurst({ trigger, className }: PetalParticleBurstProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastTriggerRef = useRef(trigger);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas with transparency
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.3; // Gravity
        particle.rotation += particle.rotationSpeed;
        particle.life--;

        // Calculate alpha based on remaining life
        const alpha = particle.life / particle.maxLife;

        if (particle.life <= 0) return false;

        // Draw petal particle
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.globalAlpha = alpha;

        // Draw petal shape (simplified cherry blossom petal)
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, particle.size * 1.2, particle.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add petal detail (center notch)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(
          0,
          particle.size * 0.3,
          particle.size * 0.3,
          particle.size * 0.2,
          0,
          0,
          Math.PI * 2,
        );
        ctx.fill();

        ctx.restore();

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Trigger particle burst when trigger changes
  useEffect(() => {
    if (trigger !== lastTriggerRef.current && trigger > 0) {
      lastTriggerRef.current = trigger;
      createBurst();
    }
  }, [trigger]);

  const createBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Petal colors (pink shades)
    const colors = [
      '#FFB6C1', // Light pink
      '#FF69B4', // Hot pink
      '#FFC0CB', // Pink
      '#FF1493', // Deep pink
      '#E75480', // Dark pink
    ];

    // Create 30-50 particles
    const particleCount = Math.floor(Math.random() * 20) + 30;

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
      const speed = Math.random() * 8 + 4;

      particlesRef.current.push({
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY + (Math.random() - 0.5) * 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 3,
        life: 60 + Math.random() * 60,
        maxLife: 60 + Math.random() * 60,
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        pointerEvents: 'none',
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
      aria-hidden="true"
    />
  );
}
