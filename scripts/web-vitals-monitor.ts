#!/usr/bin/env tsx

/**
 * Web Vitals Performance Monitor for Otaku-mori
 *
 * Generates:
 *  - public/web-vitals-monitor.js (client-side collector)
 *  - app/lib/web-vitals.ts (Next.js integration helper)
 *
 * Usage: pnpm tsx scripts/web-vitals-monitor.ts
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

interface WebVitalsMetric {
  name: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB' | 'GameCube_FPS' | 'Animation_Smoothness';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
}

interface PerformanceBudgets {
  [metric: string]: { good: number; poor: number };
}

const PERFORMANCE_BUDGETS: PerformanceBudgets = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  GameCube_FPS: { good: 58, poor: 45 },
  Animation_Smoothness: { good: 95, poor: 80 },
};

class WebVitalsMonitor {
  async run(): Promise<void> {
    await this.ensureDirectories();
    await this.writeMonitoringScript();
    await this.writeNextIntegration();
    await this.printDashboardSummary();
  }

  private async ensureDirectories(): Promise<void> {
    try {
      await fs.mkdir('public', { recursive: true });
      await fs.mkdir(path.join('app', 'lib'), { recursive: true });
    } catch (error) {
      console.warn('Directory creation skipped:', error);
    }
  }

  private async writeMonitoringScript(): Promise<void> {
    const monitoringScript = `(function () {
  'use strict';

  var budgets = ${JSON.stringify(PERFORMANCE_BUDGETS, null, 2)};
  var sessionMetrics = [];

  function getDeviceType() {
    var width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  function rateMetric(name, value) {
    var budget = budgets[name];
    if (!budget) return 'unknown';
    if (value <= budget.good) return 'good';
    if (value <= budget.poor) return 'needs-improvement';
    return 'poor';
  }

  function pushMetric(metric) {
    var enriched = Object.assign({}, metric, {
      rating: rateMetric(metric.name, metric.value),
      timestamp: Date.now(),
      deviceType: getDeviceType(),
    });

    sessionMetrics.push(enriched);

    try {
      localStorage.setItem('web-vitals-metrics', JSON.stringify(sessionMetrics));
    } catch (error) {
      console.warn('Unable to persist web vitals metrics', error);
    }

    if (enriched.rating !== 'good') {
      console.warn('[WebVitals]', enriched.name, enriched.value, enriched.rating, enriched.url);
    }
  }

  function loadWebVitals(callback) {
    if (window.webVitals) {
      callback(window.webVitals);
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
    script.async = true;
    script.onload = function () {
      callback(window.webVitals);
    };
    document.head.appendChild(script);
  }

  loadWebVitals(function (webVitals) {
    var handlers = [webVitals.onCLS, webVitals.onFID, webVitals.onLCP, webVitals.onFCP, webVitals.onTTFB];
    handlers.forEach(function (handler) {
      handler(pushMetric, { reportAllChanges: true });
    });
  });

  // Optional GameCube FPS tracking
  var frameTimes = [];
  function trackFrames() {
    var now = performance.now();
    frameTimes.push(now);
    frameTimes = frameTimes.filter(function (time) { return now - time <= 1000; });
    requestAnimationFrame(trackFrames);
  }

  requestAnimationFrame(trackFrames);
  setInterval(function () {
    var fps = frameTimes.length;
    pushMetric({
      name: 'GameCube_FPS',
      value: fps,
      url: window.location.pathname,
    });
  }, 2000);
})();`;

    await fs.writeFile(path.join('public', 'web-vitals-monitor.js'), monitoringScript, 'utf-8');
    console.warn('✔ Generated public/web-vitals-monitor.js');
  }

  private async writeNextIntegration(): Promise<void> {
    const hookScript = `import type { NextWebVitalsMetric } from 'next/app';

export function reportWebVitals(metric: NextWebVitalsMetric): void {
  try {
    const stored = JSON.parse(localStorage.getItem('web-vitals-metrics') ?? '[]');
    stored.push({
      name: metric.name,
      value: metric.value,
      delta: metric.delta,
      id: metric.id,
      rating: metric.rating,
      url: metric.path,
      timestamp: Date.now(),
    });
    localStorage.setItem('web-vitals-metrics', JSON.stringify(stored));
  } catch (error) {
    console.warn('Unable to store web vitals metric', error);
  }
}

export function useGameCubePerformance(): {
  startTracking: () => void;
  stopTracking: () => void;
} {
  let frameId: number | null = null;
  let lastTime = performance.now();
  let frameCount = 0;

  const tick = () => {
    frameCount += 1;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const fps = frameCount;
      const metrics = JSON.parse(localStorage.getItem('web-vitals-metrics') ?? '[]');
      metrics.push({
        name: 'GameCube_FPS',
        value: fps,
        rating: fps >= ${PERFORMANCE_BUDGETS.GameCube_FPS.good} ? 'good' : fps >= ${PERFORMANCE_BUDGETS.GameCube_FPS.poor} ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
        url: window.location.pathname,
        deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
      });
      localStorage.setItem('web-vitals-metrics', JSON.stringify(metrics.slice(-200)));
      frameCount = 0;
      lastTime = now;
    }
    frameId = requestAnimationFrame(tick);
  };

  return {
    startTracking() {
      if (frameId == null) {
        frameId = requestAnimationFrame(tick);
      }
    },
    stopTracking() {
      if (frameId != null) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    },
  };
}
`;

    await fs.writeFile(path.join('app', 'lib', 'web-vitals.ts'), hookScript, 'utf-8');
    console.warn('✔ Generated app/lib/web-vitals.ts');
  }

  private async printDashboardSummary(): Promise<void> {
    console.warn('\nPerformance Budgets');
    console.warn('===================');
    Object.entries(PERFORMANCE_BUDGETS).forEach(([metric, budget]) => {
      console.warn(`  ${metric}: good ≤ ${budget.good}, poor > ${budget.poor}`);
    });

    const metrics = await this.readStoredMetrics();
    if (metrics.length === 0) {
      console.warn('\nNo recorded metrics yet. Load the app with the monitoring script enabled to capture data.');
      return;
    }

    const recent = metrics.slice(-5);
    console.warn('\nRecent Metric Samples:');
    recent.forEach((metric) => {
      console.warn(
        `  ${metric.name} ${metric.value} (${metric.rating}) on ${metric.deviceType} @ ${new Date(metric.timestamp).toISOString()}`,
      );
    });
  }

  private async readStoredMetrics(): Promise<WebVitalsMetric[]> {
    try {
      const raw = await fs.readFile(path.join('public', 'web-vitals-metrics.json'), 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed as WebVitalsMetric[];
      }
      return [parsed as WebVitalsMetric];
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code !== 'ENOENT') {
        console.error('Failed to read existing metrics:', error);
      }
      return [];
    }
  }
}

async function main(): Promise<void> {
  const monitor = new WebVitalsMonitor();
  await monitor.run();
}

void main().catch((error) => {
  console.error('Failed to generate web vitals monitor assets:', error);
  process.exit(1);
});

export { WebVitalsMonitor };
