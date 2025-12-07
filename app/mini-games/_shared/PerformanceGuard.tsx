/**
 * Performance Guard Component
 *
 * Monitors FPS during gameplay and automatically reduces visual effects
 * if performance is poor (< 45 FPS). Shows performance indicator in dev mode.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface PerformanceGuardProps {
  enabled?: boolean;
  targetFPS?: number;
  onQualityChange?: (quality: 'high' | 'medium' | 'low') => void;
  showIndicator?: boolean; // Show FPS counter (dev mode)
  children?: React.ReactNode;

export interface PerformanceMetrics {
  fps: number;
  quality: 'high' | 'medium' | 'low';
  frameTime: number; // ms
}

/**
 * Performance guard that monitors FPS and adjusts quality automatically
 */
export function PerformanceGuard({
  enabled = true,
  targetFPS = 45,
  onQualityChange,
  showIndicator = process.env.NODE_ENV === 'development',
  children,
}: PerformanceGuardProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    quality: 'high',
    frameTime: 16.67,
  });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const fpsHistoryRef = useRef<number[]>([]);
  const qualityRef = useRef<'high' | 'medium' | 'low'>('high');
  const rafIdRef = useRef<number | null>(null);

  const updateQuality = useCallback(
    (newQuality: 'high' | 'medium' | 'low') => {
      if (newQuality !== qualityRef.current) {
        qualityRef.current = newQuality;
        setMetrics((prev) => ({ ...prev, quality: newQuality }));
        onQualityChange?.(newQuality);
      }
    },
    [onQualityChange],
  );

  useEffect(() => {
    if (!enabled) return;

    const measureFPS = () => {
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      frameCountRef.current++;

      // Calculate FPS every second
      if (delta >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / delta);
        const frameTime = delta / frameCountRef.current;

        // Update FPS history (keep last 10 samples)
        fpsHistoryRef.current.push(fps);
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift();
        }

        // Calculate average FPS
        const avgFPS =
          fpsHistoryRef.current.reduce((sum, val) => sum + val, 0) / fpsHistoryRef.current.length;

        setMetrics({
          fps,
          quality: qualityRef.current,
          frameTime,
        });

        // Adjust quality based on average FPS
        if (avgFPS < targetFPS) {
          // Performance is poor, reduce quality
          if (qualityRef.current === 'high') {
            updateQuality('medium');
          } else if (qualityRef.current === 'medium') {
            updateQuality('low');
          }
        } else if (avgFPS >= targetFPS + 10 && qualityRef.current !== 'high') {
          // Performance is good, try increasing quality
          if (qualityRef.current === 'low') {
            updateQuality('medium');
          } else if (qualityRef.current === 'medium') {
            updateQuality('high');
          }
        }

        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      rafIdRef.current = requestAnimationFrame(measureFPS);
    };

    rafIdRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled, targetFPS, updateQuality]);

  return (
    <>
      {children}
      {showIndicator && (
        <div className="fixed bottom-4 right-4 z-50 bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 text-xs font-mono text-white">
          <div>FPS: {metrics.fps}</div>
          <div>Quality: {metrics.quality}</div>
          <div>Frame Time: {metrics.frameTime.toFixed(2)}ms</div>
        </div>
      )}
    </>
  );
}

/**
 * Hook to get current performance quality
 * Use this in game components to adjust visual effects
 */
export function usePerformanceQuality() {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');

  const handleQualityChange = useCallback((newQuality: 'high' | 'medium' | 'low') => {
    setQuality(newQuality);
  }, []);

  return {
    quality,
    onQualityChange: handleQualityChange,
    // Helper functions for adjusting effects based on quality
    particleCount: quality === 'high' ? 50 : quality === 'medium' ? 25 : 10,
    enableBloom: quality !== 'low',
    enableShadows: quality === 'high',
    enablePostProcessing: quality !== 'low',
  };
}

