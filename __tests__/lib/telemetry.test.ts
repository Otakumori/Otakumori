import { TelemetryService } from '@/lib/telemetry';

// Mock console methods
const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();

beforeAll(() => {
  global.console = {
    ...console,
    log: mockConsoleLog,
    error: mockConsoleError,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('TelemetryService', () => {
  describe('constructor', () => {
    it('should initialize with provided config', () => {
      const config = {
        enabled: true,
        debug: true,
        vendor: 'console' as const,
      };
      const service = new TelemetryService(config);
      expect(service).toBeDefined();
    });

    it('should generate a unique session ID', () => {
      const config = { enabled: true, debug: false, vendor: 'console' as const };
      const service1 = new TelemetryService(config);
      const service2 = new TelemetryService(config);
      
      // Access private sessionId through any method that uses it
      service1.track('test', {});
      service2.track('test', {});
      
      // Should have been called twice (once for each service)
      expect(mockConsoleLog).toHaveBeenCalledTimes(2);
    });
  });

  describe('track', () => {
    it('should log events when enabled', () => {
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        vendor: 'console',
      });

      service.track('test_event', { key: 'value' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          event: 'test_event',
          properties: { key: 'value' },
          sessionId: expect.any(String),
          timestamp: expect.any(Number),
        })
      );
    });

    it('should not log events when disabled', () => {
      const service = new TelemetryService({
        enabled: false,
        debug: true,
        vendor: 'console',
      });

      service.track('test_event', { key: 'value' });

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should sanitize PII from properties', () => {
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

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          properties: {
            email: '[REDACTED]',
            phone: '[REDACTED]',
            normalData: 'safe data',
            password: '[REDACTED]',
          },
        })
      );
    });

    it('should truncate long strings', () => {
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        vendor: 'console',
      });

      const longString = 'a'.repeat(150);
      service.track('test_event', { longString });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          properties: {
            longString: 'a'.repeat(100) + '...',
          },
        })
      );
    });
  });

  describe('identify', () => {
    it('should track user identification', () => {
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        vendor: 'console',
      });

      service.identify('user123', { name: 'Test User' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          event: 'user_identified',
          properties: { name: 'Test User', userId: 'user123' },
          userId: 'user123',
        })
      );
    });
  });

  describe('page', () => {
    it('should track page views', () => {
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        vendor: 'console',
      });

      service.page('home', { section: 'hero' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          event: 'page_view',
          properties: { page: 'home', section: 'hero' },
        })
      );
    });
  });

  describe('error', () => {
    it('should track errors with context', () => {
      const service = new TelemetryService({
        enabled: true,
        debug: true,
        vendor: 'console',
      });

      const error = new Error('Test error');
      service.error(error, { component: 'test' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          event: 'error',
          properties: {
            error: 'Test error',
            stack: expect.any(String),
            component: 'test',
          },
        })
      );
    });
  });

  describe('specific event helpers', () => {
    let service: TelemetryService;

    beforeEach(() => {
      service = new TelemetryService({
        enabled: true,
        debug: true,
        vendor: 'console',
      });
    });

    it('should track shop fetch events', () => {
      service.trackShopFetch(true, 'live', 150);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          event: 'shop.fetch',
          properties: {
            success: true,
            source: 'live',
            duration: 150,
          },
        })
      );
    });

    it('should track petal collect events', () => {
      service.trackPetalCollect('hero', { x: 50, y: 100 });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          event: 'petal.collect',
          properties: {
            variant: 'hero',
            position: { x: 50, y: 100 },
          },
        })
      );
    });

    it('should track soapstone post events', () => {
      service.trackSoapstonePost(true, 42);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          event: 'soapstone.post',
          properties: {
            success: true,
            textLength: 42,
          },
        })
      );
    });

    it('should track animation performance', () => {
      service.trackAnimationPerformance('cherry-tree', 60, 2);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          event: 'animation.performance',
          properties: {
            component: 'cherry-tree',
            fps: 60,
            frameDrops: 2,
          },
        })
      );
    });

    it('should track user interactions', () => {
      service.trackUserInteraction('click', 'button', { id: 'test-btn' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        '[Telemetry]',
        expect.objectContaining({
          event: 'user.interaction',
          properties: {
            action: 'click',
            element: 'button',
            id: 'test-btn',
          },
        })
      );
    });
  });
});
