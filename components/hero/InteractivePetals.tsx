'use client';

import { useState, useEffect } from 'react';
import WebGLPetalStream from './WebGLPetalStream';

interface InteractivePetalsProps {
  variant: 'hero' | 'spacer';
  maxPetals?: number;
  className?: string;
}

export default function InteractivePetals({
  variant,
  maxPetals = 12,
  className = '',
}: InteractivePetalsProps) {
  const [useWebGL, setUseWebGL] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Check for WebGL support and performance
  useEffect(() => {
    if (reducedMotion) return;

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (gl) {
      // Check for instanced rendering support
      const ext = gl.getExtension('ANGLE_instanced_arrays');
      if (ext) {
        setUseWebGL(true);
      }
    }
  }, [reducedMotion]);

  // Don't render if reduced motion is preferred
  if (reducedMotion) {
    return null;
  }

  // Use WebGL for better performance and visuals
  if (useWebGL) {
    return (
      <WebGLPetalStream
        variant={variant}
        maxPetals={maxPetals}
        className={className}
        intensity={variant === 'hero' ? 1.0 : 0.6}
      />
    );
  }

  // Fallback to CSS animations for older browsers
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-auto ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-300/10 to-transparent animate-pulse" />
    </div>
  );
}
