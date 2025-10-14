/**
 * React hook for WebGL performance tier detection and management
 */

import { useState, useEffect, useRef } from 'react';
import {
  detectPerformanceTier,
  getQualitySettings,
  PerformanceTier,
  QualitySettings,
  PerformanceMonitor,
  PerformanceCapabilities,
} from '@/lib/webgl/performance-tiers';

export interface UsePerformanceTierOptions {
  enableAutoAdjust?: boolean; // Auto-adjust quality based on FPS
  logCapabilities?: boolean; // Log device info to console
}

export interface UsePerformanceTierReturn {
  tier: PerformanceTier;
  settings: QualitySettings;
  capabilities: PerformanceCapabilities | null;
  isLoading: boolean;
  recordFrame: (timestamp: number) => void;
  getCurrentFPS: () => number;
}

/**
 * Hook to detect and manage WebGL performance tier
 */
export function usePerformanceTier(
  options: UsePerformanceTierOptions = {},
): UsePerformanceTierReturn {
  const { enableAutoAdjust = true, logCapabilities = false } = options;

  const [tier, setTier] = useState<PerformanceTier>('medium');
  const [capabilities, setCapabilities] = useState<PerformanceCapabilities | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const monitorRef = useRef<PerformanceMonitor | null>(null);

  // Detect capabilities on mount
  useEffect(() => {
    const detected = detectPerformanceTier();
    setCapabilities(detected);
    setTier(detected.tier);
    setIsLoading(false);

    if (logCapabilities) {
      import('@/lib/webgl/performance-tiers').then(({ logDeviceCapabilities }) => {
        logDeviceCapabilities();
      });
    }

    // Initialize performance monitor
    if (enableAutoAdjust) {
      monitorRef.current = new PerformanceMonitor(detected.tier, (newTier) => {
        console.log(`🎮 Performance tier adjusted: ${tier} → ${newTier}`);
        setTier(newTier);
      });
    }
  }, [logCapabilities, enableAutoAdjust]);

  // Record frame timing for performance monitoring
  const recordFrame = (timestamp: number) => {
    if (enableAutoAdjust && monitorRef.current) {
      monitorRef.current.recordFrame(timestamp);

      // Check and adjust quality every 60 frames
      if (timestamp % 60 === 0) {
        monitorRef.current.checkAndAdjustQuality();
      }
    }
  };

  // Get current FPS
  const getCurrentFPS = (): number => {
    return monitorRef.current?.getAverageFPS() || 0;
  };

  const settings = getQualitySettings(tier);

  return {
    tier,
    settings,
    capabilities,
    isLoading,
    recordFrame,
    getCurrentFPS,
  };
}

/**
 * Simpler hook for just getting quality settings
 */
export function useQualitySettings(): QualitySettings {
  const [settings, setSettings] = useState<QualitySettings>(getQualitySettings('medium'));

  useEffect(() => {
    const capabilities = detectPerformanceTier();
    setSettings(getQualitySettings(capabilities.tier));
  }, []);

  return settings;
}
