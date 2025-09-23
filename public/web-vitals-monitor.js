/**
 * Otaku-mori Web Vitals Monitor
 * Real-time performance tracking with GameCube-specific metrics
 */

(function () {
  'use strict';

  // Performance budgets aligned with v0 specifications
  const BUDGETS = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    GameCube_FPS: { good: 58, poor: 45 },
    Animation_Smoothness: { good: 95, poor: 80 },
  };

  // Metric collection
  const metrics = [];
  let gameCubeMetrics = {
    frameCount: 0,
    droppedFrames: 0,
    lastFrameTime: performance.now(),
    animationStartTime: null,
  };

  // Utility functions
  function getRating(name, value) {
    const budget = BUDGETS[name];
    if (!budget) return 'unknown';

    if (value <= budget.good) return 'good';
    if (value <= budget.poor) return 'needs-improvement';
    return 'poor';
  }

  function getDeviceType() {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  function recordMetric(name, value, customData = {}) {
    const metric = {
      name,
      value: Math.round(value * 100) / 100,
      rating: getRating(name, value),
      timestamp: Date.now(),
      url: window.location.pathname,
      deviceType: getDeviceType(),
      ...customData,
    };

    metrics.push(metric);

    // Console logging for development
    if (metric.rating === 'poor') {
      console.warn('⚠️ Poor performance detected:', metric);
    } else if (metric.rating === 'good') {
      console.log('✅ Good performance:', metric);
    }

    // Send to analytics (replace with your analytics endpoint)
    sendToAnalytics(metric);

    return metric;
  }

  function sendToAnalytics(metric) {
    // Send to your analytics service
    if (typeof gtag !== 'undefined') {
      gtag('event', 'web_vitals', {
        event_category: 'performance',
        event_label: metric.name,
        value: Math.round(metric.value),
        custom_parameter_rating: metric.rating,
        custom_parameter_device: metric.deviceType,
      });
    }

    // You can also send to your own API endpoint
    // fetch('/api/v1/analytics/web-vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric)
    // }).catch(console.error);
  }

  // Core Web Vitals measurement
  function measureWebVitals() {
    // LCP (Largest Contentful Paint)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      recordMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID (First Input Delay)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        recordMetric('FID', entry.processingStart - entry.startTime);
      }
    }).observe({ entryTypes: ['first-input'] });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          recordMetric('CLS', clsValue);
        }
      }
    }).observe({ entryTypes: ['layout-shift'] });

    // FCP (First Contentful Paint)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          recordMetric('FCP', entry.startTime);
        }
      }
    }).observe({ entryTypes: ['paint'] });

    // TTFB (Time to First Byte)
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
      recordMetric('TTFB', navigationEntry.responseStart);
    }
  }

  // GameCube-specific performance monitoring
  function initGameCubeMonitoring() {
    let frameCount = 0;
    let droppedFrames = 0;
    let lastTime = performance.now();
    let fpsHistory = [];

    function checkFrame() {
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;

      frameCount++;

      // Expected frame time for 60fps is ~16.67ms
      if (deltaTime > 20) {
        // Allow small tolerance
        droppedFrames++;
      }

      // Calculate FPS every second
      if (currentTime - gameCubeMetrics.lastFrameTime >= 1000) {
        const fps = frameCount;
        fpsHistory.push(fps);

        // Keep last 10 seconds of FPS data
        if (fpsHistory.length > 10) {
          fpsHistory.shift();
        }

        const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
        const smoothness = Math.max(0, 100 - (droppedFrames / frameCount) * 100);

        recordMetric('GameCube_FPS', avgFps, {
          droppedFrames,
          totalFrames: frameCount,
          smoothness,
        });

        recordMetric('Animation_Smoothness', smoothness, {
          avgFps,
          droppedFrames,
        });

        // Reset counters
        frameCount = 0;
        droppedFrames = 0;
        gameCubeMetrics.lastFrameTime = currentTime;
      }

      lastTime = currentTime;

      // Continue monitoring if GameCube interface is active
      if (document.querySelector('[data-gamecube-active]')) {
        requestAnimationFrame(checkFrame);
      }
    }

    // Start monitoring when GameCube interface becomes active
    const observer = new MutationObserver(() => {
      if (document.querySelector('[data-gamecube-active]')) {
        gameCubeMetrics.animationStartTime = performance.now();
        requestAnimationFrame(checkFrame);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-gamecube-active'],
    });
  }

  // Performance budget alerts
  function setupBudgetAlerts() {
    // Alert on budget violations
    window.addEventListener('beforeunload', () => {
      const violations = metrics.filter((m) => m.rating === 'poor');
      if (violations.length > 0) {
        console.warn('Performance budget violations detected:', violations);
      }
    });

    // Periodic performance summary
    setInterval(() => {
      const recentMetrics = metrics.filter((m) => Date.now() - m.timestamp < 30000);
      const poorMetrics = recentMetrics.filter((m) => m.rating === 'poor');

      if (poorMetrics.length > 0) {
        console.warn(`🚨 ${poorMetrics.length} performance issues in last 30s`, poorMetrics);
      }
    }, 30000);
  }

  // Initialize monitoring
  function init() {
    if (typeof PerformanceObserver === 'undefined') {
      console.warn('PerformanceObserver not supported');
      return;
    }

    measureWebVitals();
    initGameCubeMonitoring();
    setupBudgetAlerts();

    console.log('🔍 Web Vitals monitoring initialized');
  }

  // Start monitoring when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for debugging
  window.otakumoriPerf = {
    metrics: () => metrics,
    budgets: BUDGETS,
    record: recordMetric,
  };
})();
