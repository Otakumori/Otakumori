import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/env/client', () => ({
  clientEnv: {
    NODE_ENV: 'development',
    NEXT_PUBLIC_TELEMETRY_ENABLED: '1',
  },
}));

import { TelemetryService } from '@/lib/telemetry';

const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

describe('TelemetryService', () => {
  beforeEach(() => {
    consoleWarn.mockClear();
  });

  it('initializes with the provided config', () => {
    const service = new TelemetryService({
      enabled: true,
      debug: true,
      vendor: 'console',
    });

    expect(service).toBeDefined();
  });

  it('generates a unique session ID', () => {
    const config = { enabled: true, debug: false, vendor: 'console' as const };
    const service1 = new TelemetryService(config);
    const service2 = new TelemetryService(config);

    expect((service1 as any).sessionId).not.toBe((service2 as any).sessionId);
  });

  it('logs events when enabled', () => {
    const service = new TelemetryService({
      enabled: true,
      debug: true,
      vendor: 'console',
    });

    service.track('test_event', { key: 'value' });

    expect(consoleWarn).toHaveBeenCalledWith('[Telemetry: test_event]', { key: 'value' });
  });

  it('does not log events when disabled', () => {
    const service = new TelemetryService({
      enabled: false,
      debug: true,
      vendor: 'console',
    });

    service.track('test_event', { key: 'value' });

    expect(consoleWarn).not.toHaveBeenCalled();
  });

  it('sanitizes PII from properties', () => {
    const service = new TelemetryService({
      enabled: true,
      debug: true,
      vendor: 'console',
    });

    service.track('test_event', {
      email: 'user@example.com',
      phone: '123-456-7890',
      normalData: 'safe data',
      password: 'secret123',
    });

    expect(consoleWarn).toHaveBeenCalledWith('[Telemetry: test_event]', {
      email: '[REDACTED]',
      phone: '[REDACTED]',
      normalData: 'safe data',
      password: '[REDACTED]',
    });
  });

  it('truncates long strings', () => {
    const service = new TelemetryService({
      enabled: true,
      debug: true,
      vendor: 'console',
    });

    service.track('test_event', { longString: 'a'.repeat(150) });

    expect(consoleWarn).toHaveBeenCalledWith('[Telemetry: test_event]', {
      longString: `${'a'.repeat(100)}...`,
    });
  });

  it('tracks user identification', () => {
    const service = new TelemetryService({
      enabled: true,
      debug: true,
      vendor: 'console',
    });

    service.identify('user123', { name: 'Test User' });

    expect(consoleWarn).toHaveBeenCalledWith('[Telemetry: user_identified]', {
      name: 'Test User',
      userId: 'user123',
    });
  });

  it('tracks page views', () => {
    const service = new TelemetryService({
      enabled: true,
      debug: true,
      vendor: 'console',
    });

    service.page('home', { section: 'hero' });

    expect(consoleWarn).toHaveBeenCalledWith('[Telemetry: page_view]', {
      page: 'home',
      section: 'hero',
    });
  });

  it('tracks errors with context', () => {
    const service = new TelemetryService({
      enabled: true,
      debug: true,
      vendor: 'console',
    });

    service.error(new Error('Test error'), { component: 'test' });

    expect(consoleWarn).toHaveBeenCalledWith('[Telemetry: error]', {
      error: 'Test error',
      stack: expect.any(String),
      component: 'test',
    });
  });

  it.each([
    ['shop.fetch', (service: TelemetryService) => service.trackShopFetch(true, 'live', 150), {
      success: true,
      source: 'live',
      duration: 150,
    }],
    ['petal.collect', (service: TelemetryService) => service.trackPetalCollect('hero', { x: 50, y: 100 }), {
      variant: 'hero',
      position: { x: 50, y: 100 },
    }],
    ['soapstone.post', (service: TelemetryService) => service.trackSoapstonePost(true, 42), {
      success: true,
      textLength: 42,
    }],
    ['animation.performance', (service: TelemetryService) => service.trackAnimationPerformance('cherry-tree', 60, 2), {
      component: 'cherry-tree',
      fps: 60,
      frameDrops: 2,
    }],
    ['user.interaction', (service: TelemetryService) => service.trackUserInteraction('click', 'button', { id: 'test-btn' }), {
      action: 'click',
      element: 'button',
      id: 'test-btn',
    }],
  ])('tracks the %s helper', (event, track, properties) => {
    const service = new TelemetryService({
      enabled: true,
      debug: true,
      vendor: 'console',
    });

    track(service);

    expect(consoleWarn).toHaveBeenCalledWith(`[Telemetry: ${event}]`, properties);
  });
});
