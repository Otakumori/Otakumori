/**
 * Next.js Web Vitals Integration for Otaku-mori v0
 * Integrates with Next.js reportWebVitals API
 */

interface WebVitalMetric {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries: any[];
  label?: string;
  attribution?: any;
}

interface ExtendedMetric extends WebVitalMetric {
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
  if (process.env.NODE_ENV === 'development') {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} ${metric.name}: ${Math.round(metric.value)}ms (${rating})`);
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

    console.log(`🎮 GameCube FPS: ${Math.round(fps)} (${fps >= 58 ? 'good' : 'poor'})`);
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
    sessionStorage.setItem(`journey_${journeyName}`, timestamp.toString());
  } else {
    const startTime = sessionStorage.getItem(`journey_${journeyName}`);
    if (startTime) {
      const duration = timestamp - parseFloat(startTime);

      if ('gtag' in window) {
        (window as any).gtag('event', 'user_journey', {
          event_category: 'Performance',
          event_label: journeyName,
          value: Math.round(duration),
        });
      }

      sessionStorage.removeItem(`journey_${journeyName}`);
    }
  }
}
