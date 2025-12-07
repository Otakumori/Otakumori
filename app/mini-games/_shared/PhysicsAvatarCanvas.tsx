'use client';

import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { PhysicsCharacterRenderer } from './PhysicsCharacterRenderer';

interface PhysicsAvatarCanvasProps {
  characterType?: 'player' | 'succubus' | 'demon_lord' | 'default';
  quality?: 'low' | 'medium' | 'high';
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  onImpact?: (force: { x: number; y: number }, part: string) => void;
  enabled?: boolean;

export interface PhysicsAvatarCanvasRef {
  applyImpact: (force: { x: number; y: number }, part: string) => void;
}

export const PhysicsAvatarCanvas = forwardRef<PhysicsAvatarCanvasRef, PhysicsAvatarCanvasProps>(
  (
    {
      characterType = 'player',
      quality = 'high',
      width = 120,
      height = 160,
      className = '',
      style = {},
      onImpact,
      enabled = true,
    },
    ref,
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<PhysicsCharacterRenderer | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(performance.now());

    // Expose impact function via ref
    const applyImpact = useCallback(
      (force: { x: number; y: number }, part: string = 'chest') => {
        if (rendererRef.current) {
          rendererRef.current.applyImpact(force, part);
        }
        if (onImpact) {
          onImpact(force, part);
        }
      },
      [onImpact],
    );

    useImperativeHandle(ref, () => ({
      applyImpact,
    }));

    // Initialize physics renderer
    useEffect(() => {
      if (!canvasRef.current || !enabled) return;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      rendererRef.current = new PhysicsCharacterRenderer(ctx, characterType, {
        quality,
        enabled: true,
      });

      // Start animation loop
      const animate = (currentTime: number) => {
        if (!rendererRef.current || !canvasRef.current) return;

        const deltaTime = Math.min(0.033, (currentTime - lastUpdateRef.current) / 1000);
        lastUpdateRef.current = currentTime;

        // Clear canvas
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Update physics
        rendererRef.current.update(deltaTime, { x: 0, y: 0 }, { x: width / 2, y: height / 2 });

        // Render character
        rendererRef.current.render(width / 2, height / 2, 'right');

        animationFrameRef.current = requestAnimationFrame(animate);
      };

      animationFrameRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (rendererRef.current) {
          rendererRef.current.dispose();
          rendererRef.current = null;
        }
      };
    }, [characterType, quality, width, height, enabled]);

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={className}
        style={style}
        aria-label="Physics-enhanced avatar"
      />
    );
  },
);

PhysicsAvatarCanvas.displayName = 'PhysicsAvatarCanvas';

// Hook for easier integration
export function usePhysicsAvatarCanvas(
  characterType: 'player' | 'succubus' | 'demon_lord' | 'default' = 'player',
  quality: 'low' | 'medium' | 'high' = 'high',
) {
  const impactRef = useRef<((force: { x: number; y: number }, part: string) => void) | null>(null);

  const applyImpact = useCallback((force: { x: number; y: number }, part: string = 'chest') => {
    if (impactRef.current) {
      impactRef.current(force, part);
    }
  }, []);

  const AvatarComponent = useCallback(
    (props: Omit<PhysicsAvatarCanvasProps, 'characterType' | 'quality' | 'onImpact'>) => (
      <PhysicsAvatarCanvas
        {...props}
        characterType={characterType}
        quality={quality}
        onImpact={(force, part) => {
          impactRef.current?.(force, part);
        }}
      />
    ),
    [characterType, quality],
  );

  return {
    AvatarComponent,
    applyImpact,
  };
}
