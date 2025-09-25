/**
 * Performance Monitoring Integration
 *
 * This module integrates the performance monitoring system with the app.
 */

export {
  initializePerformanceMonitoring,
  initializeBundleAnalysis,
  initializeCoreWebVitalsMonitoring,
  BundleAnalyzer,
  CoreWebVitalsMonitor,
  type PerformanceMetrics,
  type PerformanceBudget,
  DEFAULT_PERFORMANCE_BUDGET,
} from '@/lib/performance/bundle-analyzer';
