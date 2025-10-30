#!/usr/bin/env tsx

/**
 * Web Vitals Performance Monitor for Otaku-mori v0
 * Real-time monitoring of Core Web Vitals and custom GameCube performance metrics
 *
 * Usage: npm run performance:monitor
 */

import { promises as fs } from 'fs';
import path from 'path';

interface WebVitalsMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'GameCube_FPS' | 'Animation_Smoothness';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
}

interface PerformanceBudgets {
  LCP: { good: 2500; poor: 4000 }; // Largest Contentful Paint (ms)
  FID: { good: 100; poor: 300 }; // First Input Delay (ms)
  CLS: { good: 0.1; poor: 0.25 }; // Cumulative Layout Shift
  FCP: { good: 1800; poor: 3000 }; // First Contentful Paint (ms)
  TTFB: { good: 800; poor: 1800 }; // Time to First Byte (ms)
  GameCube_FPS: { good: 58; poor: 45 }; // GameCube interface FPS
  Animation_Smoothness: { good: 95; poor: 80 }; // Animation frame consistency %
}

class WebVitalsMonitor {
  private budgets: PerformanceBudgets = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
    GameCube_FPS: { good: 58, poor: 45 },
    Animation_Smoothness: { good: 95, poor: 80 },
  };

  async generateMonitoringScript(): Promise<void> {
    // '⌕ Generating Web Vitals monitoring script...\n'

    const monitoringScript = this.createClientMonitoringScript();
    const hookScript = this.createNextJSHook();

    // Ensure directories exist
    try {
      await fs.mkdir('public', { recursive: true });
      await fs.mkdir(path.join('app', 'lib'), { recursive: true });
    } catch (error) {
      // 'Directories already exist'
    }

    // Write client-side monitoring script
    const publicPath = path.join('public', 'web-vitals-monitor.js');
    // `Writing client monitoring script to: ${publicPath}`
    await fs.writeFile(publicPath, monitoringScript);

    // Write Next.js integration hook
    const libPath = path.join('app', 'lib', 'web-vitals.ts');
    // `Writing Next.js integration to: ${libPath}`
    await fs.writeFile(libPath, hookScript);

    // ' Web Vitals monitoring files generated:'
    // '    public/web-vitals-monitor.js - Client-side monitoring'
    // '    app/lib/web-vitals.ts - Next.js integration'

    // '\n Integration Steps:'
    // '1. Add to app/layout.tsx:'
    // '   import { reportWebVitals } from "@/lib/web-vitals"'
    // '   useEffect(( => { reportWebVitals(); }, []);');
    // '\n2. Include script in production build:'
    // '   <script src="/web-vitals-monitor.js" defer />'

    this.generatePerformanceDashboard();
  }

  private createClientMonitoringScript(): string {
    return `
/**
 * Otaku-mori Web Vitals Monitor
 * Real-time performance tracking with GameCube-specific metrics
 */

(function() {
  'use strict';

  // Performance budgets aligned with v0 specifications
  const BUDGETS = ${JSON.stringify(this.budgets, null, 2)};

  // Metric collection
  const metrics = [];
  let gameCubeMetrics = {
    frameCount: 0,
    droppedFrames: 0,
    lastFrameTime: performance.now(),
    animationStartTime: null
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
      ...customData
    };

    metrics.push(metric);

    // Console logging for development
    if (metric.rating === 'poor') {
      console.warn(' Poor performance detected:', metric);
    } else if (metric.rating === 'good') {
      // ' Good performance:', metric
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
        custom_parameter_device: metric.deviceType
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
      if (deltaTime > 20) { // Allow small tolerance
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
        const smoothness = Math.max(0, 100 - (droppedFrames / frameCount * 100));

        recordMetric('GameCube_FPS', avgFps, {
          droppedFrames,
          totalFrames: frameCount,
          smoothness
        });

        recordMetric('Animation_Smoothness', smoothness, {
          avgFps,
          droppedFrames
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
      attributeFilter: ['data-gamecube-active']
    });
  }

  // Performance budget alerts
  function setupBudgetAlerts() {
    // Alert on budget violations
    window.addEventListener('beforeunload', () => {
      const violations = metrics.filter(m => m.rating === 'poor');
      if (violations.length > 0) {
        console.warn('Performance budget violations detected:', violations);
      }
    });

    // Periodic performance summary
    setInterval(() => {
      const recentMetrics = metrics.filter(m => Date.now() - m.timestamp < 30000);
      const poorMetrics = recentMetrics.filter(m => m.rating === 'poor');
      
      if (poorMetrics.length > 0) {
        console.warn(\` \${poorMetrics.length} performance issues in last 30s\`, poorMetrics);
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

    // '⌕ Web Vitals monitoring initialized'
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
    record: recordMetric
  };

})();
`;
  }

  private createNextJSHook(): string {
    return `
/**
 * Next.js Web Vitals Integration for Otaku-mori v0
 * Integrates with Next.js reportWebVitals API
 */

import { Metric } from 'web-vitals';

interface ExtendedMetric extends Metric {
  label?: string;
  attribution?: any;
}

const BUDGETS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
} as const;

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const budget = BUDGETS[name as keyof typeof BUDGETS];
  if (!budget) return 'good';
  
  if (value <= budget.good) return 'good';
  if (value <= budget.poor) return 'needs-improvement';
  return 'poor';
}

export function reportWebVitals(metric: ExtendedMetric) {
  const rating = getRating(metric.name, metric.value);
  
  // Log performance metrics
  if (env.NODE_ENV === 'development') {
    const emoji = rating === 'good' ? '' : rating === 'needs-improvement' ? '' : '';
    // \`\${emoji} \${metric.name}: \${Math.round(metric.value}ms (\${rating})\`);
  }

  // Send to analytics
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if ('gtag' in window) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.label,
        value: Math.round(metric.value),
        custom_parameter_rating: rating,
        non_interaction: true,
      });
    }

    // Custom analytics endpoint
    const data = {
      name: metric.name,
      value: metric.value,
      rating,
      label: metric.label,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    // Uncomment to send to your analytics API
    // fetch('/api/v1/analytics/web-vitals', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(data),
    // }).catch(console.error);
  }
}

// GameCube performance utilities
export class GameCubePerformanceTracker {
  private static instance: GameCubePerformanceTracker;
  private frameCount = 0;
  private startTime = 0;
  private isTracking = false;

  static getInstance(): GameCubePerformanceTracker {
    if (!this.instance) {
      this.instance = new GameCubePerformanceTracker();
    }
    return this.instance;
  }

  startTracking(): void {
    if (this.isTracking) return;
    
    this.isTracking = true;
    this.frameCount = 0;
    this.startTime = performance.now();
    
    this.trackFrame();
  }

  stopTracking(): void {
    this.isTracking = false;
    
    const duration = performance.now() - this.startTime;
    const fps = (this.frameCount / duration) * 1000;
    
    // Report GameCube FPS as a custom metric
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'GameCube_FPS', {
        event_category: 'GameCube Performance',
        value: Math.round(fps),
        custom_parameter_rating: fps >= 58 ? 'good' : fps >= 45 ? 'needs-improvement' : 'poor',
      });
    }

    // \` GameCube FPS: \${Math.round(fps} (\${fps >= 58 ? 'good' : 'poor'})\`);
  }

  private trackFrame(): void {
    if (!this.isTracking) return;
    
    this.frameCount++;
    requestAnimationFrame(() => this.trackFrame());
  }
}

// Hook for GameCube components
export function useGameCubePerformance() {
  const tracker = GameCubePerformanceTracker.getInstance();
  
  return {
    startTracking: () => tracker.startTracking(),
    stopTracking: () => tracker.stopTracking(),
  };
}

// Performance monitoring for critical user journeys
export function trackUserJourney(journeyName: string, action: 'start' | 'complete') {
  if (typeof window === 'undefined') return;
  
  const timestamp = performance.now();
  
  if (action === 'start') {
    sessionStorage.setItem(\`journey_\${journeyName}\`, timestamp.toString());
  } else {
    const startTime = sessionStorage.getItem(\`journey_\${journeyName}\`);
    if (startTime) {
      const duration = timestamp - parseFloat(startTime);
      
      if ('gtag' in window) {
        (window as any).gtag('event', 'user_journey', {
          event_category: 'Performance',
          event_label: journeyName,
          value: Math.round(duration),
        });
      }
      
      sessionStorage.removeItem(\`journey_\${journeyName}\`);
    }
  }
}
`;
  }

  private generatePerformanceDashboard(): void {
    // '\n Performance Monitoring Dashboard Setup:'
    // '='.repeat(60);

    // '\n Performance Budgets:'
    Object.entries(this.budgets).forEach(([metric, budget]) => {
      // `   ${metric}: Good ≤ ${budget.good}, Poor > ${budget.poor}`
    });

    // '\n Development Monitoring:'
    // '   • Console logs for poor performance'
    // '   • Real-time FPS tracking for GameCube'
    // '   • Automatic budget violation alerts'

    // '\n Production Analytics:'
    // '   • Google Analytics 4 integration'
    // '   • Custom API endpoint support'
    // '   • User journey performance tracking'

    // '\n GameCube Specific Metrics:'
    // '   • 60fps target monitoring'
    // '   • Animation smoothness tracking'
    // '   • Frame drop detection'
    // '   • Component-level performance'

    // '\n Usage Examples:'
    // `
    // In GameCube components:
    import { useGameCubePerformance } from '@/lib/web-vitals';
    
    const { startTracking, stopTracking } = useGameCubePerformance();

    useEffect(() => {
      startTracking();
      return () => stopTracking();
    }, []);

    // For user journeys:
    // import { trackUserJourney } from '@/lib/web-vitals';
    // trackUserJourney('checkout', 'start');
    // ... user completes checkout
    // trackUserJourney('checkout', 'complete');
    `);

    // '\n='.repeat(60);
  }
}

async function main() {
  const monitor = new WebVitalsMonitor();
  await monitor.generateMonitoringScript();

  // '\n Web Vitals monitoring system ready!'
  // ' Next steps:'
  // '1. Integrate monitoring scripts into your app'
  // '2. Run performance audit: npm run performance:audit'
  // '3. Monitor GameCube interface performance'
  // '4. Set up production analytics endpoints'
}

// ES module entry point check
// if (import.meta.url === `file://${process.argv[1]}`) {
//   main().catch(console.error);
// }

export { WebVitalsMonitor };
