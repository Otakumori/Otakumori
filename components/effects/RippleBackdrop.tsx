/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
'use client';

import { useEffect, useRef } from 'react';

export default function RippleBackdrop({
  durationMs = 6000,
  strength = 1,
}: {
  durationMs?: number;
  strength?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let startTime = Date.now();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % durationMs) / durationMs;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create ripple effect
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const maxRadius = Math.max(canvas.width, canvas.height) * 0.8;
      const radius = maxRadius * progress;

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);

      const alpha = Math.sin(progress * Math.PI * 2) * 0.3 * strength;
      gradient.addColorStop(0, `rgba(255, 105, 180, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(255, 20, 147, ${alpha * 0.5})`);
      gradient.addColorStop(1, 'rgba(255, 105, 180, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [durationMs, strength]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        filter: 'blur(1px)',
        opacity: 0.6,
      }}
    />
  );
}
