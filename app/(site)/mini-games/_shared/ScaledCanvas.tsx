'use client';

import { useRef, useEffect, type CSSProperties } from 'react';

interface ScaledCanvasProps {
  width: number;
  height: number;
  className?: string;
  style?: CSSProperties;
  onReady?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
  onResize?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, scale: number) => void;
}

/**
 * Canvas component with automatic devicePixelRatio scaling for crisp rendering on high-DPI displays
 */
export function ScaledCanvas({
  width,
  height,
  className = '',
  style,
  onReady,
  onResize,
}: ScaledCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const scaleRef = useRef(1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    ctxRef.current = ctx;

    const updateScale = () => {
      const dpr = window.devicePixelRatio || 1;
      scaleRef.current = dpr;

      // Set actual canvas size in pixels
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      // Set display size in CSS pixels
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Scale context to match device pixel ratio
      ctx.scale(dpr, dpr);

      // Set default rendering hints for crisp text/shapes
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      onResize?.(canvas, ctx, dpr);
    };

    updateScale();
    onReady?.(canvas, ctx);

    // Handle window resize
    const handleResize = () => {
      updateScale();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [width, height, onReady, onResize]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={style}
      width={width}
      height={height}
    />
  );
}

/**
 * Hook to get scaled canvas context
 */
export function useScaledCanvas(
  width: number,
  height: number,
  onReady?: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // Set actual canvas size in pixels
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    // Set display size in CSS pixels
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Scale context to match device pixel ratio
    ctx.scale(dpr, dpr);

    // Set default rendering hints
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctxRef.current = ctx;
    onReady?.(canvas, ctx);

    const handleResize = () => {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [width, height, onReady]);

  return { canvasRef, ctxRef };
}

