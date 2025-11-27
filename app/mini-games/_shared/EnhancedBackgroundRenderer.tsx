'use client';

/**
 * Enhanced Background Renderer Component
 *
 * Parallax background layers with atmospheric effects
 */

import { useEffect, useRef, useState } from 'react';
import { getBackgroundProfile, type BackgroundProfile } from '@/app/lib/enhancements/game-visuals';

interface EnhancedBackgroundRendererProps {
  /**
   * Background profile name
   */
  profile?: string;
  /**
   * Custom background profile
   */
  customProfile?: BackgroundProfile;
  /**
   * Scroll offset for parallax
   */
  scrollOffset?: number;
  /**
   * Width
   */
  width?: number;
  /**
   * Height
   */
  height?: number;
  /**
   * Class name for styling
   */
  className?: string;
}

export default function EnhancedBackgroundRenderer({
  profile = 'default',
  customProfile,
  scrollOffset = 0,
  width,
  height,
  className = '',
}: EnhancedBackgroundRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [backgroundProfile, setBackgroundProfile] = useState<BackgroundProfile>(
    customProfile || getBackgroundProfile(profile),
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    if (width && height) {
      canvas.width = width;
      canvas.height = height;
    } else {
      canvas.width = canvas.offsetWidth || 800;
      canvas.height = canvas.offsetHeight || 600;
    }

    // Render background
    const render = () => {
      ctx.fillStyle = backgroundProfile.color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Render parallax layers
      backgroundProfile.layers.forEach((layer, index) => {
        const offset = scrollOffset * layer.speed;
        ctx.globalAlpha = layer.opacity;

        // Draw layer (simplified - can be extended with actual layer content)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * layer.opacity})`;
        ctx.fillRect(0, offset, canvas.width, canvas.height);
      });

      ctx.globalAlpha = 1.0;
    };

    render();
  }, [backgroundProfile, scrollOffset, width, height]);

  // Update profile if prop changes
  useEffect(() => {
    if (customProfile) {
      setBackgroundProfile(customProfile);
    } else {
      setBackgroundProfile(getBackgroundProfile(profile));
    }
  }, [profile, customProfile]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: 'block',
        width: width || '100%',
        height: height || '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
      }}
    />
  );
}

