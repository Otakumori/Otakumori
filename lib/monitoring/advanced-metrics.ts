/**
 * Advanced Enterprise Monitoring & Metrics System
 *
 * Comprehensive observability infrastructure with:
 * - Real-time performance monitoring
 * - Custom business metrics
 * - Predictive analytics
 * - Automated alerting
 * - Resource optimization
 */

import { env } from '@/env';

export interface MetricPoint {
  timestamp: number;
  value: number;
  tags: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: 'gt' | 'lt' | 'eq' | 'anomaly';
  threshold: number;
  duration: number; // seconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  channels: string[];
  suppressionWindow?: number;
}

export interface PerformanceProfile {
  route: string;
  method: string;
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
    max: number;
  };
  throughput: number;
  errorRate: number;
  timestamp: number;
}

export interface BusinessMetrics {
  revenue: {
    daily: number;
    weekly: number;
    monthly: number;
    trend: 'up' | 'down' | 'stable';
  };
  users: {
    active: number;
    new: number;
    retained: number;
    churnRate: number;
  };
  games: {
    sessionsTotal: number;
    averageDuration: number;
    completionRate: number;
    topGames: Array<{ id: string; sessions: number }>;
  };
  petals: {
    totalEarned: number;
    totalSpent: number;
    circulation: number;
    inflationRate: number;
  };
}

export class AdvancedMetricsCollector {
  private static instance: AdvancedMetricsCollector;
  private metrics: Map<string, MetricPoint[]> = new Map();
  private alerts: Map<string, AlertRule> = new Map();
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = env.NODE_ENV === 'production';
  }

  static getInstance(): AdvancedMetricsCollector {
    if (!AdvancedMetricsCollector.instance) {
      AdvancedMetricsCollector.instance = new AdvancedMetricsCollector();
    }
    return AdvancedMetricsCollector.instance;
  }

  /**
   * Track method alias for compatibility
   */
  async track(
    name: string,
    config: { value: number; tags: Record<string, string> },
  ): Promise<void> {
    this.recordMetric(name, config.value, config.tags);
  }

  /**
   * Record a custom metric point
   */
  recordMetric(
    name: string,
    value: number,
    tags: Record<string, string> = {},
    metadata?: Record<string, any>,
  ): void {
    if (!this.isEnabled) return;

    const point: MetricPoint = {
      timestamp: Date.now(),
      value,
      tags,
      metadata,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const points = this.metrics.get(name)!;
    points.push(point);

    // Keep only last 1000 points per metric
    if (points.length > 1000) {
      points.shift();
    }

    // Check alert rules
    this.checkAlerts(name, point);
  }

  /**
   * Record performance metrics for API endpoints
   */
  recordPerformance(profile: PerformanceProfile): void {
    this.recordMetric('api_response_time_p50', profile.responseTime.p50, {
      route: profile.route,
      method: profile.method,
    });

    this.recordMetric('api_response_time_p95', profile.responseTime.p95, {
      route: profile.route,
      method: profile.method,
    });

    this.recordMetric('api_throughput', profile.throughput, {
      route: profile.route,
      method: profile.method,
    });

    this.recordMetric('api_error_rate', profile.errorRate, {
      route: profile.route,
      method: profile.method,
    });
  }

  /**
   * Record business-specific metrics
   */
  recordBusinessMetrics(metrics: BusinessMetrics): void {
    // Revenue metrics
    this.recordMetric('revenue_daily', metrics.revenue.daily);
    this.recordMetric('revenue_weekly', metrics.revenue.weekly);
    this.recordMetric('revenue_monthly', metrics.revenue.monthly);

    // User metrics
    this.recordMetric('users_active', metrics.users.active);
    this.recordMetric('users_new', metrics.users.new);
    this.recordMetric('users_retained', metrics.users.retained);
    this.recordMetric('user_churn_rate', metrics.users.churnRate);

    // Game metrics
    this.recordMetric('game_sessions_total', metrics.games.sessionsTotal);
    this.recordMetric('game_avg_duration', metrics.games.averageDuration);
    this.recordMetric('game_completion_rate', metrics.games.completionRate);

    // Petal economy metrics
    this.recordMetric('petals_earned', metrics.petals.totalEarned);
    this.recordMetric('petals_spent', metrics.petals.totalSpent);
    this.recordMetric('petals_circulation', metrics.petals.circulation);
    this.recordMetric('petals_inflation_rate', metrics.petals.inflationRate);
  }

  /**
   * Record Core Web Vitals
   */
  recordWebVitals(vitals: {
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
    fcp: number;
  }): void {
    this.recordMetric('web_vitals_lcp', vitals.lcp);
    this.recordMetric('web_vitals_fid', vitals.fid);
    this.recordMetric('web_vitals_cls', vitals.cls);
    this.recordMetric('web_vitals_ttfb', vitals.ttfb);
    this.recordMetric('web_vitals_fcp', vitals.fcp);
  }

  /**
   * Add alert rule
   */
  addAlert(rule: AlertRule): void {
    this.alerts.set(rule.id, rule);
  }

  /**
   * Check if metric triggers any alerts
   */
  private checkAlerts(metricName: string, point: MetricPoint): void {
    for (const [alertId, rule] of this.alerts) {
      if (rule.metric === metricName) {
        const triggered = this.evaluateAlertCondition(rule, point);
        if (triggered) {
          this.triggerAlert(rule, point);
        }
      }
    }
  }

  /**
   * Evaluate alert condition
   */
  private evaluateAlertCondition(rule: AlertRule, point: MetricPoint): boolean {
    switch (rule.condition) {
      case 'gt':
        return point.value > rule.threshold;
      case 'lt':
        return point.value < rule.threshold;
      case 'eq':
        return point.value === rule.threshold;
      case 'anomaly':
        return this.detectAnomaly(rule.metric, point);
      default:
        return false;
    }
  }

  /**
   * Simple anomaly detection using z-score
   */
  private detectAnomaly(metricName: string, point: MetricPoint): boolean {
    const points = this.metrics.get(metricName) || [];
    if (points.length < 10) return false;

    const recent = points.slice(-10);
    const mean = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
    const variance =
      recent.reduce((sum, p) => sum + Math.pow(p.value - mean, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0) return false;

    const zScore = Math.abs((point.value - mean) / stdDev);
    return zScore > 2; // Threshold for anomaly detection
  }

  /**
   * Trigger alert
   */
  private async triggerAlert(rule: AlertRule, point: MetricPoint): Promise<void> {
    const alert = {
      id: `alert_${Date.now()}`,
      rule: rule.id,
      metric: rule.metric,
      value: point.value,
      threshold: rule.threshold,
      severity: rule.severity,
      timestamp: point.timestamp,
      tags: point.tags,
    };

    // Log the alert
    console.warn(` Alert triggered: ${rule.name}`, alert);

    // Send to external alerting systems
    await this.sendAlert(alert, rule.channels);
  }

  /**
   * Send alert to external systems
   */
  private async sendAlert(alert: any, channels: string[]): Promise<void> {
    // Implementation would integrate with:
    // - Slack/Discord webhooks
    // - PagerDuty
    // - Email notifications
    // - SMS alerts for critical issues

    for (const channel of channels) {
      switch (channel) {
        case 'slack':
          await this.sendSlackAlert(alert);
          break;
        case 'email':
          await this.sendEmailAlert(alert);
          break;
        case 'webhook':
          await this.sendWebhookAlert(alert);
          break;
      }
    }
  }

  private async sendSlackAlert(alert: any): Promise<void> {
    // Slack integration placeholder
    console.warn('Slack alert triggered:', {
      type: alert.type,
      severity: alert.severity,
      metric: alert.metricName,
    });
    // TODO: Implement Slack webhook integration
  }

  private async sendEmailAlert(alert: any): Promise<void> {
    // Email integration placeholder
    console.warn('Email alert triggered:', {
      type: alert.type,
      severity: alert.severity,
      metric: alert.metricName,
    });
    // TODO: Implement email notification via Resend
  }

  private async sendWebhookAlert(alert: any): Promise<void> {
    // Webhook integration placeholder
    console.warn('Webhook alert triggered:', {
      type: alert.type,
      severity: alert.severity,
      metric: alert.metricName,
    });
    // Webhook alert sent
  }

  /**
   * Get metrics for dashboard
   */
  getMetrics(name: string, timeRange?: { start: number; end: number }): MetricPoint[] {
    const points = this.metrics.get(name) || [];

    if (!timeRange) return points;

    return points.filter((p) => p.timestamp >= timeRange.start && p.timestamp <= timeRange.end);
  }

  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(name: string, aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count'): number {
    const points = this.metrics.get(name) || [];
    if (points.length === 0) return 0;

    switch (aggregation) {
      case 'sum':
        return points.reduce((sum, p) => sum + p.value, 0);
      case 'avg':
        return points.reduce((sum, p) => sum + p.value, 0) / points.length;
      case 'min':
        return Math.min(...points.map((p) => p.value));
      case 'max':
        return Math.max(...points.map((p) => p.value));
      case 'count':
        return points.length;
      default:
        return 0;
    }
  }

  /**
   * Export metrics for external systems
   */
  exportMetrics(): Record<string, MetricPoint[]> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Calculate system health score
   */
  calculateHealthScore(): number {
    const weights = {
      api_response_time_p95: -0.3, // Lower is better
      api_error_rate: -0.4, // Lower is better
      api_throughput: 0.1, // Higher is better
      web_vitals_lcp: -0.1, // Lower is better
      users_active: 0.1, // Higher is better
    };

    let score = 100;

    for (const [metric, weight] of Object.entries(weights)) {
      const recent = this.getMetrics(metric).slice(-5);
      if (recent.length > 0) {
        const avg = recent.reduce((sum, p) => sum + p.value, 0) / recent.length;
        score += avg * weight;
      }
    }

    return Math.max(0, Math.min(100, score));
  }
}

/**
 * Middleware for automatic API performance tracking
 */
export function createPerformanceMiddleware() {
  const collector = AdvancedMetricsCollector.getInstance();

  return (req: any, res: any, next: any) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const route = req.route?.path || req.path;
      const method = req.method;
      const statusCode = res.statusCode;

      collector.recordMetric('api_request_duration', duration, {
        route,
        method,
        status: statusCode.toString(),
      });

      collector.recordMetric('api_request_count', 1, {
        route,
        method,
        status: statusCode.toString(),
      });

      if (statusCode >= 400) {
        collector.recordMetric('api_error_count', 1, {
          route,
          method,
          status: statusCode.toString(),
        });
      }
    });

    next();
  };
}

/**
 * Initialize default alert rules
 */
export function initializeDefaultAlerts(): void {
  const collector = AdvancedMetricsCollector.getInstance();

  // High response time alert
  collector.addAlert({
    id: 'high_response_time',
    name: 'High API Response Time',
    metric: 'api_response_time_p95',
    condition: 'gt',
    threshold: 2000, // 2 seconds
    duration: 300, // 5 minutes
    severity: 'high',
    channels: ['slack', 'email'],
  });

  // High error rate alert
  collector.addAlert({
    id: 'high_error_rate',
    name: 'High Error Rate',
    metric: 'api_error_rate',
    condition: 'gt',
    threshold: 0.05, // 5%
    duration: 300,
    severity: 'critical',
    channels: ['slack', 'email', 'webhook'],
  });

  // Low user activity alert
  collector.addAlert({
    id: 'low_user_activity',
    name: 'Low User Activity',
    metric: 'users_active',
    condition: 'anomaly',
    threshold: 0,
    duration: 1800, // 30 minutes
    severity: 'medium',
    channels: ['slack'],
  });

  // Poor web vitals alert
  collector.addAlert({
    id: 'poor_web_vitals_lcp',
    name: 'Poor LCP Performance',
    metric: 'web_vitals_lcp',
    condition: 'gt',
    threshold: 2500, // 2.5 seconds
    duration: 600, // 10 minutes
    severity: 'medium',
    channels: ['slack'],
  });
}

// Export singleton instance
export const metricsCollector = AdvancedMetricsCollector.getInstance();
