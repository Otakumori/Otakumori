'use client';

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
        console.warn('Performance monitoring failed to initialize:', error);
      }
    };

    initModule();
  }, []);

  return null; // This component doesn't render anything
}
