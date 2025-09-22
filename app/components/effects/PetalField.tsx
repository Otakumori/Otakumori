'use client';

import { useEffect, useRef } from 'react';

interface PetalFieldProps {
  density?: 'auth' | 'site' | 'home';
}

export default function PetalField({ density = 'site' }: PetalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const petalsRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      rotation: number;
      rotationSpeed: number;
      life: number;
      maxLife: number;
    }>
  >([]);

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

    // Petal configuration based on density
    const config = {
      auth: { count: 8, speed: 0.5, size: 0.8 },
      site: { count: 12, speed: 0.3, size: 1.0 },
      home: { count: 20, speed: 0.4, size: 1.2 },
    };

    const { count, speed, size } = config[density];

    // Create initial petals
    const createPetal = () => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 0.5,
      vy: Math.random() * speed + 0.2,
      size: Math.random() * 8 + 4,
      opacity: Math.random() * 0.6 + 0.2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
      life: 0,
      maxLife: Math.random() * 200 + 300,
    });

    // Initialize petals
    for (let i = 0; i < count; i++) {
      petalsRef.current.push(createPetal());
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      petalsRef.current.forEach((petal, index) => {
        // Update petal
        petal.x += petal.vx;
        petal.y += petal.vy;
        petal.rotation += petal.rotationSpeed;
        petal.life++;

        // Fade out over time
        const lifeRatio = petal.life / petal.maxLife;
        petal.opacity = (1 - lifeRatio) * 0.8;

        // Draw petal
        ctx.save();
        ctx.translate(petal.x, petal.y);
        ctx.rotate(petal.rotation);
        ctx.globalAlpha = petal.opacity;
        ctx.fillStyle = `hsl(${320 + Math.random() * 20}, 70%, 80%)`;

        // Draw petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Remove old petals and add new ones
        if (petal.life > petal.maxLife || petal.y > canvas.height + 50) {
          petalsRef.current[index] = createPetal();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        background: 'transparent',
        opacity: 0.6,
      }}
    />
  );
}
