'use client';

/**
 * Enhanced Hit Feedback Component
 *
 * Visual feedback for game hits (score popups, screen shake, etc.)
 */

import { useEffect, useRef } from 'react';
import { HitEffectSystem, getHitEffectColor, getHitEffectAnimation } from '@/app/lib/vfx/hit-effects';
import type { HitEffect } from '@/app/lib/vfx/hit-effects';

interface EnhancedHitFeedbackProps {
  /**
   * Canvas width
   */
  width?: number;
  /**
   * Canvas height
   */
  height?: number;
  /**
   * Hit effect system instance (optional)
   */
  hitSystem?: HitEffectSystem;
  /**
   * Class name for styling
   */
  className?: string;
}

export default function EnhancedHitFeedback({
  width,
  height,
  hitSystem: externalSystem,
  className = '',
}: EnhancedHitFeedbackProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const systemRef = useRef<HitEffectSystem | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use external system or create new one
    const system = externalSystem || new HitEffectSystem();
    systemRef.current = system;

    // Set canvas size
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
    } else {
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 600;
    }

    // Animation loop
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 16.67, 2);
      lastTime = currentTime;

      // Update system
      system.update(deltaTime);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply screen shake
      const [shakeX, shakeY] = system.getScreenShakeOffset();
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Draw hit effects
      const effects = system.getEffects();
      effects.forEach((effect) => {
        const color = getHitEffectColor(effect.type);
        const animation = getHitEffectAnimation(effect.type);

        ctx.save();
        ctx.globalAlpha = effect.life * animation.opacity;

        // Draw score popup
        if (effect.type === 'score' && effect.value !== undefined) {
          const scale = 1 + (1 - effect.life) * (animation.scale - 1);
          const y = effect.y + (1 - effect.life) * animation.yOffset;

          ctx.translate(effect.x, y);
          ctx.scale(scale, scale);

          ctx.fillStyle = color;
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`+${effect.value}`, 0, 0);
        } else if (effect.type === 'perfect') {
          // Draw perfect indicator
          const scale = 1 + (1 - effect.life) * (animation.scale - 1);
          const y = effect.y + (1 - effect.life) * animation.yOffset;

          ctx.translate(effect.x, y);
          ctx.scale(scale, scale);

          ctx.fillStyle = color;
          ctx.font = 'bold 32px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('PERFECT!', 0, 0);
        }

        ctx.restore();
      });

      ctx.restore();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [externalSystem, width, height]);

  // Expose system methods via ref
  useEffect(() => {
    if (canvasRef.current && systemRef.current) {
      (canvasRef.current as any).addHitEffect = (effect: Omit<HitEffect, 'life'>) => {
        systemRef.current?.addEffect(effect);
      };
      (canvasRef.current as any).shake = (intensity: number, duration: number, frequency: number) => {
        systemRef.current?.shake({ intensity, duration, frequency });
      };
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
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    />
  );
}

