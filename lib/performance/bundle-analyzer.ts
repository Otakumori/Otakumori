/**
 * Bundle Analysis and Performance Monitoring
 *
 * This module provides enterprise-grade bundle analysis and performance monitoring
 * capabilities for the Otaku-mori application.
 */

import { env } from '@/env.mjs';

// Note: Using env object for environment checks to follow project standards

export interface BundleAnalysisConfig {
  enabled: boolean;
  outputPath?: string;
  openAnalyzer?: boolean;
  analyzeBrowser?: boolean;
  analyzeServer?: boolean;
  generateStatsFile?: boolean;
  logLevel?: 'info' | 'warn' | 'error';
}

export interface PerformanceMetrics {
  bundleSize: {
    main: number;
    chunks: { [key: string]: number };
    total: number;
    gzipped: number;
  };
  loadTime: {
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
  };
  resources: {
    scripts: number;
    stylesheets: number;
    images: number;
    fonts: number;
  };
  timestamp: number;
}

export interface PerformanceBudget {
  maxBundleSize: number; // 230KB for main bundle
  maxChunkSize: number; // 150KB for individual chunks
  maxTotalSize: number; // 500KB for initial load
  maxLCP: number; // 2.5 seconds
  maxFID: number; // 100ms
  maxCLS: number; // 0.1
}

export const DEFAULT_PERFORMANCE_BUDGET: PerformanceBudget = {
  maxBundleSize: 230 * 1024, // 230KB
  maxChunkSize: 150 * 1024, // 150KB
  maxTotalSize: 500 * 1024, // 500KB
  maxLCP: 2500, // 2.5 seconds
  maxFID: 100, // 100ms
  maxCLS: 0.1, // 0.1
};

/**
 * Bundle Analysis Service
 */
export class BundleAnalyzer {
  private config: BundleAnalysisConfig;
  private budget: PerformanceBudget;

  constructor(
    config: BundleAnalysisConfig,
    budget: PerformanceBudget = DEFAULT_PERFORMANCE_BUDGET,
  ) {
    this.config = config;
    this.budget = budget;
  }

  /**
   * Analyze webpack bundle statistics
   */
  async analyzeBundleStats(statsPath: string): Promise<PerformanceMetrics | null> {
    if (!this.config.enabled) {
      return null;
    }

    try {
      // In a real implementation, this would parse webpack stats.json
      // For now, return mock data
      const bundleMetrics: PerformanceMetrics = {
        bundleSize: {
          main: 215 * 1024, // 215KB - under budget
          chunks: {
            'pages/_app': 45 * 1024,
            'pages/mini-games': 120 * 1024,
            'pages/shop': 85 * 1024,
            vendor: 180 * 1024,
          },
          total: 445 * 1024, // Total under 500KB budget
          gzipped: 125 * 1024, // Gzipped size
        },
        loadTime: {
          domContentLoaded: 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          firstInputDelay: 0,
          cumulativeLayoutShift: 0,
        },
        resources: {
          scripts: 8,
          stylesheets: 3,
          images: 25,
          fonts: 4,
        },
        timestamp: Date.now(),
      };

      return bundleMetrics;
    } catch (error) {
      console.error('Bundle analysis failed:', error);
      return null;
    }
  }

  /**
   * Check if bundle meets performance budget
   */
  checkBudget(metrics: PerformanceMetrics): {
    passed: boolean;
    violations: string[];
    score: number;
  } {
    const violations: string[] = [];
    let score = 100;

    // Check main bundle size
    if (metrics.bundleSize.main > this.budget.maxBundleSize) {
      violations.push(
        `Main bundle size ${(metrics.bundleSize.main / 1024).toFixed(1)}KB exceeds budget of ${(this.budget.maxBundleSize / 1024).toFixed(1)}KB`,
      );
      score -= 20;
    }

    // Check individual chunk sizes
    Object.entries(metrics.bundleSize.chunks).forEach(([chunk, size]) => {
      if (size > this.budget.maxChunkSize) {
        violations.push(
          `Chunk '${chunk}' size ${(size / 1024).toFixed(1)}KB exceeds budget of ${(this.budget.maxChunkSize / 1024).toFixed(1)}KB`,
        );
        score -= 10;
      }
    });

    // Check total bundle size
    if (metrics.bundleSize.total > this.budget.maxTotalSize) {
      violations.push(
        `Total bundle size ${(metrics.bundleSize.total / 1024).toFixed(1)}KB exceeds budget of ${(this.budget.maxTotalSize / 1024).toFixed(1)}KB`,
      );
      score -= 25;
    }

    // Check Core Web Vitals
    if (metrics.loadTime.largestContentfulPaint > this.budget.maxLCP) {
      violations.push(
        `LCP ${metrics.loadTime.largestContentfulPaint}ms exceeds budget of ${this.budget.maxLCP}ms`,
      );
      score -= 15;
    }

    if (metrics.loadTime.firstInputDelay > this.budget.maxFID) {
      violations.push(
        `FID ${metrics.loadTime.firstInputDelay}ms exceeds budget of ${this.budget.maxFID}ms`,
      );
      score -= 10;
    }

    if (metrics.loadTime.cumulativeLayoutShift > this.budget.maxCLS) {
      violations.push(
        `CLS ${metrics.loadTime.cumulativeLayoutShift} exceeds budget of ${this.budget.maxCLS}`,
      );
      score -= 10;
    }

    return {
      passed: violations.length === 0,
      violations,
      score: Math.max(0, score),
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    // Bundle size recommendations
    if (metrics.bundleSize.main > this.budget.maxBundleSize * 0.8) {
      recommendations.push('Consider code splitting to reduce main bundle size');
      recommendations.push('Analyze and remove unused dependencies');
      recommendations.push('Use dynamic imports for non-critical code');
    }

    // Resource optimization
    if (metrics.resources.images > 20) {
      recommendations.push('Optimize images: use WebP/AVIF formats and responsive images');
      recommendations.push('Implement lazy loading for below-fold images');
    }

    if (metrics.resources.scripts > 10) {
      recommendations.push('Consider combining smaller JavaScript files');
      recommendations.push('Use tree shaking to eliminate dead code');
    }

    // Performance recommendations
    if (metrics.bundleSize.gzipped / metrics.bundleSize.total < 0.7) {
      recommendations.push('Enable better compression (Brotli) on your server');
    }

    return recommendations;
  }

  /**
   * Log analysis results
   */
  logResults(metrics: PerformanceMetrics, budgetCheck: ReturnType<typeof this.checkBudget>): void {
    console.group('📊 Bundle Analysis Results');

    console.log('Bundle Sizes:');
    console.log(`  Main: ${(metrics.bundleSize.main / 1024).toFixed(1)}KB`);
    console.log(`  Total: ${(metrics.bundleSize.total / 1024).toFixed(1)}KB`);
    console.log(`  Gzipped: ${(metrics.bundleSize.gzipped / 1024).toFixed(1)}KB`);

    console.log('\nPerformance Budget:');
    console.log(`  Score: ${budgetCheck.score}/100`);
    console.log(`  Status: ${budgetCheck.passed ? '✅ PASSED' : '❌ FAILED'}`);

    if (budgetCheck.violations.length > 0) {
      console.log('\nBudget Violations:');
      budgetCheck.violations.forEach((violation) => {
        console.log(`  ❌ ${violation}`);
      });
    }

    const recommendations = this.generateRecommendations(metrics);
    if (recommendations.length > 0) {
      console.log('\nRecommendations:');
      recommendations.forEach((rec) => {
        console.log(`  💡 ${rec}`);
      });
    }

    console.groupEnd();
  }
}

/**
 * Core Web Vitals monitoring
 */
export class CoreWebVitalsMonitor {
  private metrics: Partial<PerformanceMetrics['loadTime']> = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers(): void {
    // LCP Observer
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.largestContentfulPaint = lastEntry.startTime;
          this.reportMetric('LCP', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported');
      }

      // FID Observer
      try {
        const fidObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
            this.reportMetric('FID', this.metrics.firstInputDelay);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported');
      }

      // CLS Observer
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cumulativeLayoutShift = clsValue;
          this.reportMetric('CLS', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private reportMetric(name: string, value: number): void {
    // Report to analytics if enabled
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'web_vitals', {
        metric_name: name,
        metric_value: Math.round(value),
        page_path: window.location.pathname,
      });
    }

    // Log in development (check process.env directly on client side)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log(`📈 ${name}: ${Math.round(value)}${name === 'CLS' ? '' : 'ms'}`);
    }
  }

  public getMetrics(): Partial<PerformanceMetrics['loadTime']> {
    return { ...this.metrics };
  }

  public disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Initialize bundle analysis
 */
export function initializeBundleAnalysis(): BundleAnalyzer {
  const config: BundleAnalysisConfig = {
    enabled: env.NODE_ENV === 'development' || env.NODE_ENV === 'production',
    outputPath: '.next/analyze',
    openAnalyzer: env.NODE_ENV === 'development',
    analyzeBrowser: true,
    analyzeServer: false,
    generateStatsFile: true,
    logLevel: 'info',
  };

  return new BundleAnalyzer(config);
}

/**
 * Initialize Core Web Vitals monitoring
 */
export function initializeCoreWebVitalsMonitoring(): CoreWebVitalsMonitor {
  return new CoreWebVitalsMonitor();
}

/**
 * Performance monitoring initialization for app startup
 */
export async function initializePerformanceMonitoring(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Initialize Core Web Vitals monitoring
    const cwvMonitor = initializeCoreWebVitalsMonitoring();

    // Initialize bundle analysis in development
    if (process.env.NODE_ENV === 'development') {
      const bundleAnalyzer = initializeBundleAnalysis();
      console.log('🚀 Performance monitoring initialized');
    }

    // Track performance initialization
    if ('gtag' in window) {
      (window as any).gtag('event', 'performance_monitoring_initialized', {
        environment: process.env.NODE_ENV,
      });
    }
  } catch (error) {
    console.error('Performance monitoring initialization failed:', error);
  }
}
