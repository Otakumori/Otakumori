'use client';
import React, { useEffect, useRef } from 'react';
import CherryTree from './tree/CherryTree';

export default function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let running = true;
    const stars: { x: number; y: number; z: number }[] = [];
    const numStars = 200;
    const speed = 0.03;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * canvas.width,
        });
      }
    };
    const updateStars = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        star.z -= speed;
        if (star.z <= 0) star.z = canvas.width;
        const k = 128.0 / star.z;
        const px = star.x * k + canvas.width / 2;
        const py = star.y * k + canvas.height / 2;
        if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
          const size = Math.max(0.1, (1 - star.z / canvas.width) * 1.5); // Ensure size is never negative
          ctx.fillStyle = 'rgba(255,255,255,0.7)';
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      requestAnimationFrame(updateStars);
    };
    resizeCanvas();
    initStars();
    updateStars();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      running = false;
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />
      <div className="absolute bottom-0 left-0 h-[100svh] w-auto z-10 pointer-events-none">
        <CherryTree />
      </div>
    </div>
  );
}
