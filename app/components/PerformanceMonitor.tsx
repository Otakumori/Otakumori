'use client';

import { useEffect } from 'react';
import { env } from '@/app/env';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Feature flag to control performance monitoring
    const FEATURE_PERF_MODULE = (env.NEXT_PUBLIC_FEATURE_PERF_MODULE ?? 'true') !== 'false';

    if (!FEATURE_PERF_MODULE) {
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
