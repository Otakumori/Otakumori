'use client';

import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Feature flag to control performance monitoring
    const FEATURE_PERF_MODULE = process.env.NEXT_PUBLIC_FEATURE_PERF_MODULE !== 'false';

    if (!FEATURE_PERF_MODULE) {
      return;
    }

    // Initialize performance monitoring when component mounts
    const initModule = async () => {
      try {
        const { initPerformanceMonitoring } = await import('../lib/performance');
        initPerformanceMonitoring();
      } catch (error) {
        console.warn('Performance monitoring failed to initialize:', error);
      }
    };

    initModule();
  }, []);

  return null; // This component doesn't render anything
}
