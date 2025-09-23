// Performance monitoring utilities for Otaku-mori v0

interface PerformanceMetrics {
  lcp?: number;
  fid?: number;
  cls?: number;
  fcp?: number;
  ttfb?: number;
}

// Performance budget constants
export const PERFORMANCE_BUDGETS = {
  LCP: 2500, // 2.5 seconds
  FID: 100, // 100 milliseconds
  CLS: 0.1, // 0.1
  FCP: 1800, // 1.8 seconds
  TTFB: 600, // 600 milliseconds
  JS_BUNDLE_SIZE: 230000, // 230KB gzipped
} as const;

// Web Vitals monitoring
export function measureWebVitals(): void {
  if (typeof window === 'undefined') return;

  // Measure LCP
  if ('PerformanceObserver' in window) {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;

      if (lastEntry) {
        const lcp = lastEntry.startTime;
        reportMetric('lcp', lcp);

        if (lcp > PERFORMANCE_BUDGETS.LCP) {
          console.warn(`LCP exceeded budget: ${lcp}ms > ${PERFORMANCE_BUDGETS.LCP}ms`);
        }
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }
  }

  // Measure FID
  if ('PerformanceObserver' in window) {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const fid = entry.processingStart - entry.startTime;
        reportMetric('fid', fid);

        if (fid > PERFORMANCE_BUDGETS.FID) {
          console.warn(`FID exceeded budget: ${fid}ms > ${PERFORMANCE_BUDGETS.FID}ms`);
        }
      });
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported
    }
  }

  // Measure CLS
  if ('PerformanceObserver' in window) {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      reportMetric('cls', clsValue);

      if (clsValue > PERFORMANCE_BUDGETS.CLS) {
        console.warn(`CLS exceeded budget: ${clsValue} > ${PERFORMANCE_BUDGETS.CLS}`);
      }
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported
    }
  }
}

// Report metrics to analytics
function reportMetric(name: string, value: number): void {
  // Send to GA4
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'web_vitals', {
      metric_name: name,
      metric_value: Math.round(value),
      metric_delta: Math.round(value),
    });
  }

  // Send to Sentry
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.addBreadcrumb({
      category: 'performance',
      message: `Web Vital: ${name}`,
      data: { value },
      level: 'info',
    });
  }
}

// Bundle size monitoring
export function measureBundleSize(): void {
  if (typeof window === 'undefined') return;

  // Estimate bundle size from loaded scripts
  const scripts = document.querySelectorAll('script[src]');
  let totalSize = 0;

  scripts.forEach((script) => {
    const src = script.getAttribute('src');
    if (src && src.includes('_next/static')) {
      // This is a rough estimate - in production, use proper bundle analysis
      totalSize += 50000; // Estimate 50KB per chunk
    }
  });

  if (totalSize > PERFORMANCE_BUDGETS.JS_BUNDLE_SIZE) {
    console.warn(
      `Bundle size exceeded budget: ${totalSize} bytes > ${PERFORMANCE_BUDGETS.JS_BUNDLE_SIZE} bytes`,
    );
  }

  // Report to analytics
  if (window.gtag) {
    window.gtag('event', 'bundle_size', {
      size_bytes: totalSize,
      budget_bytes: PERFORMANCE_BUDGETS.JS_BUNDLE_SIZE,
    });
  }
}

// Image optimization utilities
export function optimizeImage(
  src: string,
  width?: number,
  height?: number,
  quality: number = 80,
): string {
  // In production, use Next.js Image component or a proper image optimization service
  if (src.startsWith('/') || src.startsWith('http')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    params.set('q', quality.toString());

    return `${src}?${params.toString()}`;
  }

  return src;
}

// Lazy loading utilities
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {},
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Preload critical resources
export function preloadCriticalResources(): void {
  if (typeof window === 'undefined') return;

  // Preload critical fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href =
    'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@300;400;500;700&display=swap';
  fontLink.as = 'style';
  document.head.appendChild(fontLink);

  // Preload critical images
  const criticalImages = ['/images/sakura-tree.svg', '/images/logo.svg'];

  criticalImages.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = src;
    link.as = 'image';
    document.head.appendChild(link);
  });
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if (typeof window === 'undefined' || !('memory' in performance)) return;

  const memory = (performance as any).memory;
  const usedMB = memory.usedJSHeapSize / 1024 / 1024;
  const totalMB = memory.totalJSHeapSize / 1024 / 1024;

  if (usedMB > 50) {
    // 50MB threshold
    console.warn(`High memory usage: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
  }

  // Report to analytics
  if (window.gtag) {
    window.gtag('event', 'memory_usage', {
      used_mb: Math.round(usedMB),
      total_mb: Math.round(totalMB),
    });
  }
}

// Performance budget checker
export function checkPerformanceBudget(): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  // This would be implemented with actual performance measurements
  // For now, return a placeholder
  return {
    passed: violations.length === 0,
    violations,
  };
}

// Initialize performance monitoring
export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Measure Web Vitals
  measureWebVitals();

  // Measure bundle size after page load
  window.addEventListener('load', () => {
    measureBundleSize();
    monitorMemoryUsage();
  });

  // Preload critical resources
  preloadCriticalResources();
}
