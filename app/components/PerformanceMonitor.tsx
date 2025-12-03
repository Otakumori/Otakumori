'use client';

import { logger } from '@/app/lib/logger';
import { useEffect } from 'react';
import { FEATURE_FLAGS } from '@/constants.client';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Feature flag to control performance monitoring
    if (!FEATURE_FLAGS.performanceMonitorEnabled) {
      return;
    }

    // Initialize performance monitoring when component mounts
    const initModule = async () => {
      try {
        const { initializePerformanceMonitoring } = await import('../lib/performance');
        initializePerformanceMonitoring();
      } catch (error) {
        logger.warn('Performance monitoring failed to initialize:', undefined, { error: error instanceof Error ? error : new Error(String(error)) });
      }
    };

    initModule();
  }, []);

  return null; // This component doesn't render anything
}
