'use client';

/**
 * GameCanvas Component
 * Mounts canvas once and never re-renders per-frame
 * All rendering happens inside the game runtime loop
 */

import { useEffect, useRef } from 'react';
import type { GameRuntime } from './GameRuntime';

interface GameCanvasProps {
  runtime: GameRuntime;
  className?: string;
  onMouseMove?: (x: number, y: number) => void;
  onMouseDown?: (x: number, y: number) => void;
  onMouseUp?: (x: number, y: number) => void;
}

export function GameCanvas({
  runtime,
  className = '',
  onMouseMove,
  onMouseDown,
  onMouseUp,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || initializedRef.current) {
      return;
    }

    // Initialize runtime with canvas (only once)
    runtime.initialize(canvas);
    initializedRef.current = true;

    // Handle window resize
    const handleResize = () => {
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio, 2);

      canvas.width = rect.width * pixelRatio;
      canvas.height = rect.height * pixelRatio;
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    // Handle mouse events
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onMouseMove?.(x, y);
    };

    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onMouseDown?.(x, y);
    };

    const handleMouseUp = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onMouseUp?.(x, y);
    };

    if (onMouseMove) canvas.addEventListener('mousemove', handleMouseMove);
    if (onMouseDown) canvas.addEventListener('mousedown', handleMouseDown);
    if (onMouseUp) canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (onMouseMove) canvas.removeEventListener('mousemove', handleMouseMove);
      if (onMouseDown) canvas.removeEventListener('mousedown', handleMouseDown);
      if (onMouseUp) canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [runtime, onMouseMove, onMouseDown, onMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated', // For pixel art games, can be overridden
      }}
    />
  );
}

