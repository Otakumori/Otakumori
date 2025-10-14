/**
 * Performance Monitor Component
 * Visual indicator of current performance tier and FPS
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceTier } from '@/hooks/usePerformanceTier';
import type { PerformanceTier } from '@/lib/webgl/performance-tiers';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export default function PerformanceMonitor({
  showDetails = false,
  position = 'top-right',
}: PerformanceMonitorProps) {
  const { tier, capabilities, settings, getCurrentFPS, recordFrame } = usePerformanceTier();
  const [isExpanded, setIsExpanded] = useState(false);
  const [fps, setFps] = useState(0);

  // Update FPS display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setFps(getCurrentFPS());
    }, 1000);
    return () => clearInterval(interval);
  }, [getCurrentFPS]);

  // Record frames for performance monitoring
  useEffect(() => {
    let frameId: number;
    const animate = (timestamp: number) => {
      recordFrame(timestamp);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [recordFrame]);

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const tierColors: Record<PerformanceTier, string> = {
    high: 'bg-green-500',
    medium: 'bg-yellow-500',
    low: 'bg-orange-500',
    unsupported: 'bg-red-500',
  };

  const tierLabels: Record<PerformanceTier, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    unsupported: 'Unsupported',
  };

  const fpsColor = fps >= 50 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400';

  if (!showDetails) return null;

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      <AnimatePresence>
        {isExpanded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[300px] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${tierColors[tier]} animate-pulse`}
                  aria-hidden="true"
                />
                Performance Monitor
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/50 hover:text-white/80 transition-colors text-xs"
                aria-label="Collapse performance monitor"
              >
                ✕
              </button>
            </div>

            {/* FPS Display */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-white/70 text-xs">FPS</span>
                <span className={`font-mono font-bold ${fpsColor}`}>{fps}</span>
              </div>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full ${fps >= 50 ? 'bg-green-400' : fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'} transition-all`}
                  style={{ width: `${Math.min(100, (fps / 60) * 100)}%` }}
                />
              </div>
            </div>

            {/* Quality Tier */}
            <div className="mb-4">
              <span className="text-white/70 text-xs block mb-2">Quality Tier</span>
              <div className="flex gap-2">
                {(['high', 'medium', 'low'] as PerformanceTier[]).map((t) => (
                  <div
                    key={t}
                    className={`flex-1 px-2 py-1 rounded text-xs font-medium text-center ${
                      tier === t
                        ? 'bg-pink-600 text-white'
                        : 'bg-white/10 text-white/50'
                    }`}
                  >
                    {tierLabels[t]}
                  </div>
                ))}
              </div>
            </div>

            {/* Device Info */}
            {capabilities && (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-white/50">Performance</span>
                  <span className="text-white/90 capitalize">{tier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">GPU</span>
                  <span className="text-white/90 text-right truncate max-w-[150px]">
                    {capabilities.gpuInfo.renderer}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">WebGL</span>
                  <span className="text-white/90">
                    {capabilities.webglVersion === 2 ? 'WebGL 2' : 'WebGL 1'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Max Texture</span>
                  <span className="text-white/90">{capabilities.maxTextureSize}px</span>
                </div>
              </div>
            )}

            {/* Quality Settings */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-white/70 text-xs block mb-2">Active Settings</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-white/50 block">Texture Size</span>
                  <span className="text-white/90">{settings.textureSize}px</span>
                </div>
                <div>
                  <span className="text-white/50 block">Shadows</span>
                  <span className="text-white/90 capitalize">{settings.shadowQuality}</span>
                </div>
                <div>
                  <span className="text-white/50 block">Particles</span>
                  <span className="text-white/90">{settings.particleCount}</span>
                </div>
                <div>
                  <span className="text-white/50 block">AA</span>
                  <span className="text-white/90">{settings.antiAliasing ? 'On' : 'Off'}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsExpanded(true)}
            className="bg-black/60 backdrop-blur-sm border border-white/20 rounded-full px-3 py-2 shadow-lg hover:bg-black/80 transition-all flex items-center gap-2"
            aria-label="Show performance monitor"
          >
            <span className={`w-2 h-2 rounded-full ${tierColors[tier]} animate-pulse`} />
            <span className={`font-mono text-sm ${fpsColor}`}>{fps}</span>
            <span className="text-white/50 text-xs">FPS</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
