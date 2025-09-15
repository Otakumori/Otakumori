'use client';

import { useEffect, useRef, useState } from 'react';

type Props = { density?: number; speed?: number };

export default function StarfieldPurple({ density = 0.72, speed = 0.62 }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

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
    const canvas = ref.current;
    if (!canvas || prefersReducedMotion) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let w = 0,
      h = 0;
    const fit = () => {
      w = Math.floor(window.innerWidth * DPR);
      h = Math.floor(window.innerHeight * DPR);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    fit();

    let backdrop: CanvasGradient;
    const buildGrad = () => {
      backdrop = ctx.createRadialGradient(
        w * 0.5,
        h * 0.32,
        Math.min(w, h) * 0.04,
        w * 0.5,
        h * 0.65,
        Math.max(w, h) * 0.95,
      );
      backdrop.addColorStop(0.0, '#1a0f2a');
      backdrop.addColorStop(0.35, '#120b1f');
      backdrop.addColorStop(1.0, '#080611');
    };
    buildGrad();

    interface Star {
      x: number;
      y: number;
      z: number;
      pz: number;
    }
    const spawn = (): Star => {
      const z = Math.random() * 0.95 + 0.05;
      return { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1, z, pz: z };
    };

    const count = () => {
      const area = (w * h) / (DPR * DPR);
      let c = Math.round((area / 1800) * density);
      if (window.matchMedia('(max-width: 768px)').matches) c = Math.round(c * 0.6);
      return Math.max(140, Math.min(c, 1100));
    };

    let stars: Star[] = Array.from({ length: count() }, spawn);

    const drawBG = () => {
      ctx.fillStyle = '#080611';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, w, h);

      // faint vignette + soft aurora glow
      const glow = ctx.createRadialGradient(
        w * 0.5,
        h * 0.62,
        Math.max(w, h) * 0.18,
        w * 0.5,
        h * 0.62,
        Math.max(w, h) * 1.0,
      );
      glow.addColorStop(0, 'rgba(210, 170, 255, 0.05)');
      glow.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
    };

    const drawStars = (dt: number) => {
      const fov = Math.min(w, h) * 0.8;
      const zStep = Math.max(0.15, speed);
      ctx.lineWidth = 1 * DPR;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.pz = s.z;
        s.z -= dt * zStep * (0.15 + s.z * 1.1);
        if (s.z <= 0.02) {
          stars[i] = spawn();
          continue;
        }

        const sx = (s.x / s.z) * fov + w * 0.5;
        const sy = (s.y / s.z) * fov + h * 0.5;
        const psx = (s.x / s.pz) * fov + w * 0.5;
        const psy = (s.y / s.pz) * fov + h * 0.5;

        const alpha = 0.8 - s.z * 0.65;
        const size = Math.max(0.5 * DPR, (1 - s.z) * 2.0 * DPR);
        const col = `rgba(240,225,255,${alpha})`; // white-lavender

        ctx.strokeStyle = col;
        ctx.beginPath();
        ctx.moveTo(psx, psy);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let raf = 0;
    let last = performance.now();
    let running = true;

    const frame = (now: number) => {
      if (!isVisible || prefersReducedMotion) return;

      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      drawBG();
      drawStars(dt);
      if (running && isVisible && !prefersReducedMotion) {
        raf = requestAnimationFrame(frame);
      }
    };

    const onResize = () => {
      fit();
      buildGrad();
      stars = Array.from({ length: count() }, spawn);
    };

    window.addEventListener('resize', onResize);

    last = performance.now();
    if (running && isVisible && !prefersReducedMotion) {
      raf = requestAnimationFrame(frame);
    }
    drawBG();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, [density, speed, isVisible, prefersReducedMotion]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 -z-10 h-screen w-screen pointer-events-none bg-gradient-radial-purple"
    />
  );
}
