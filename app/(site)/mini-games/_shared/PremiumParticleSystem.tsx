'use client';

/**
 * Premium Particle System Component
 *
 * Reusable particle system for games with multiple particle types
 */

import { useEffect, useRef } from 'react';
import { ParticleSystem, type ParticleConfig } from '@/app/lib/vfx/particles';

interface PremiumParticleSystemProps {
  /**
   * Canvas width
   */
  width?: number;
  /**
   * Canvas height
   */
  height?: number;
  /**
   * Particle system instance (optional, will create if not provided)
   */
  particleSystem?: ParticleSystem;
  /**
   * Auto-start animation
   */
  autoStart?: boolean;
  /**
   * Class name for styling
   */
  className?: string;
}

export default function PremiumParticleSystem({
  width,
  height,
  particleSystem: externalSystem,
  autoStart = true,
  className = '',
}: PremiumParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<ParticleSystem | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use external system or create new one
    const system = externalSystem || new ParticleSystem(canvas);
    systemRef.current = system;

    // Set canvas size
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
    } else {
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 600;
    }

    // Start animation if auto-start is enabled
    if (autoStart) {
      system.start();
    }

    return () => {
      system.stop();
      system.clear();
    };
  }, [externalSystem, autoStart, width, height]);

  /**
   * Emit particles (exposed via ref)
   */
  const emit = (config: ParticleConfig) => {
    systemRef.current?.emit(config);
  };

  // Expose emit function via ref (if needed)
  useEffect(() => {
    if (canvasRef.current && systemRef.current) {
      (canvasRef.current as any).emitParticles = emit;
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: width || '100%',
        height: height || '100%',
      }}
    />
  );
}

