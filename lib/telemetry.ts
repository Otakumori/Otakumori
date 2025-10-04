/**
 * Telemetry shim for development and production monitoring
 * Pluggable design allows easy vendor swapping later
 */

import { env } from '@/env';

// Environment variables for telemetry configuration
const isDevelopment = env.NODE_ENV === 'development';
const isTelemetryEnabled = (env as any).NEXT_PUBLIC_TELEMETRY_ENABLED === '1';

interface TelemetryEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

interface TelemetryConfig {
  enabled: boolean;
  debug: boolean;
  vendor?: 'console' | 'posthog' | 'mixpanel' | 'custom';
  apiKey?: string;
}

class TelemetryService {
  private config: TelemetryConfig;
  private sessionId: string;

  constructor(config: TelemetryConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    // Remove PII and sensitive data
    const sanitized = { ...properties };

    // Remove common PII fields
    const piiFields = ['email', 'phone', 'ssn', 'creditCard', 'password', 'token'];
    piiFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Truncate long strings
    Object.keys(sanitized).forEach((key) => {
      if (typeof sanitized[key] === 'string' && sanitized[key].length > 100) {
        sanitized[key] = sanitized[key].substring(0, 100) + '...';
      }
    });

    return sanitized;
  }

  private logEvent(event: TelemetryEvent): void {
    if (!this.config.enabled) return;

    const sanitizedEvent = {
      ...event,
      properties: event.properties ? this.sanitizeProperties(event.properties) : undefined,
      timestamp: event.timestamp || Date.now(),
      sessionId: this.sessionId,
    };

    if (this.config.debug) {
      // Debug logging disabled in production
      // console.log('[Telemetry]', sanitizedEvent);
    }

    // Route to appropriate vendor
    switch (this.config.vendor) {
      case 'console':
        this.logToConsole(sanitizedEvent);
        break;
      case 'posthog':
        this.logToPostHog(sanitizedEvent);
        break;
      case 'mixpanel':
        this.logToMixpanel(sanitizedEvent);
        break;
      default:
        this.logToConsole(sanitizedEvent);
    }
  }

  private logToConsole(event: TelemetryEvent): void {
    // Console logging disabled in production
    // console.log(`[${event.event}]`, event.properties);
  }

  private logToPostHog(event: TelemetryEvent): void {
    // PostHog integration would go here
    if (typeof window !== 'undefined' && (window as any).posthog) {
      (window as any).posthog.capture(event.event, event.properties);
    }
  }

  private logToMixpanel(event: TelemetryEvent): void {
    // Mixpanel integration would go here
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(event.event, event.properties);
    }
  }

  // Public API methods
  track(event: string, properties?: Record<string, any>): void {
    this.logEvent({ event, properties });
  }

  identify(userId: string, properties?: Record<string, any>): void {
    this.logEvent({
      event: 'user_identified',
      properties: { ...properties, userId },
      userId,
    });
  }

  page(pageName: string, properties?: Record<string, any>): void {
    this.logEvent({
      event: 'page_view',
      properties: { page: pageName, ...properties },
    });
  }

  error(error: Error, context?: Record<string, any>): void {
    this.logEvent({
      event: 'error',
      properties: {
        error: error.message,
        stack: error.stack,
        ...context,
      },
    });
  }

  // Specific event helpers
  trackShopFetch(success: boolean, source: string, duration?: number): void {
    this.track('shop.fetch', {
      success,
      source,
      duration,
    });
  }

  trackPetalCollect(variant: string, position: { x: number; y: number }): void {
    this.track('petal.collect', {
      variant,
      position,
    });
  }

  trackSoapstonePost(success: boolean, textLength: number): void {
    this.track('soapstone.post', {
      success,
      textLength,
    });
  }

  trackAnimationPerformance(component: string, fps: number, frameDrops: number): void {
    this.track('animation.performance', {
      component,
      fps,
      frameDrops,
    });
  }

  trackUserInteraction(action: string, element: string, properties?: Record<string, any>): void {
    this.track('user.interaction', {
      action,
      element,
      ...properties,
    });
  }
}

// Default configuration
const defaultConfig: TelemetryConfig = {
  enabled: isDevelopment || isTelemetryEnabled,
  debug: isDevelopment,
  vendor: 'console',
};

// Create singleton instance
export const telemetry = new TelemetryService(defaultConfig);

// Export types for external use
export type { TelemetryEvent, TelemetryConfig };
