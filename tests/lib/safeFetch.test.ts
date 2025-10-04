import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { safeFetch, probeEndpoint, fetchLiveData, isBlocked, isSuccess } from '@/lib/safeFetch';

// Mock the env module
vi.mock('@/env', () => ({
  env: {
    NEXT_PUBLIC_LIVE_DATA: '0',
    NEXT_PUBLIC_PROBE_MODE: '1',
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('safeFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset env mock to default values
    vi.mocked(require('@/env').env).NEXT_PUBLIC_LIVE_DATA = '0';
    vi.mocked(require('@/env').env).NEXT_PUBLIC_PROBE_MODE = '1';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('when live data is disabled', () => {
    it('should return blocked result when not in probe mode', async () => {
      const result = await safeFetch('/api/test');

      expect(result).toEqual({
        ok: false,
        blocked: true,
        error: 'Live data is disabled',
        source: 'blocked',
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return blocked result when allowLive is true but live data is disabled', async () => {
      const result = await safeFetch('/api/test', { allowLive: true });

      expect(result).toEqual({
        ok: false,
        blocked: true,
        error: 'Live data is disabled',
        source: 'blocked',
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe('when in probe mode', () => {
    it('should make HEAD request with probe parameter when probeOnly is true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await safeFetch('/api/test', { probeOnly: true });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test?probe=1'),
        expect.objectContaining({
          method: 'HEAD',
          headers: {
            'User-Agent': 'Otaku-mori/1.0.0 (Probe)',
          },
        }),
      );
      expect(result).toEqual({
        ok: true,
        data: undefined,
        error: undefined,
        source: 'probe',
      });
    });

    it('should handle probe request timeout', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AbortError')), 100);
          }),
      );

      const result = await safeFetch('/api/test', { probeOnly: true, timeout: 50 });

      expect(result).toEqual({
        ok: false,
        error: 'AbortError',
        source: 'probe',
      });
    });

    it('should handle probe request failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await safeFetch('/api/test', { probeOnly: true });

      expect(result).toEqual({
        ok: false,
        data: undefined,
        error: 'Probe failed: 404',
        source: 'probe',
      });
    });
  });

  describe('when live data is enabled', () => {
    beforeEach(() => {
      vi.mocked(require('@/env').env).NEXT_PUBLIC_LIVE_DATA = '1';
    });

    it('should make live request when allowLive is true', async () => {
      const mockData = { products: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await safeFetch('/api/test', { allowLive: true });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          next: { revalidate: 60 },
          headers: {
            'User-Agent': 'Otaku-mori/1.0.0 (Live)',
            Accept: 'application/json',
          },
          credentials: 'omit',
        }),
      );
      expect(result).toEqual({
        ok: true,
        data: mockData,
        source: 'live',
      });
    });

    it('should handle live request timeout', async () => {
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AbortError')), 100);
          }),
      );

      const result = await safeFetch('/api/test', { allowLive: true, timeout: 50 });

      expect(result).toEqual({
        ok: false,
        error: 'AbortError',
        source: 'live',
      });
    });

    it('should handle live request HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await safeFetch('/api/test', { allowLive: true });

      expect(result).toEqual({
        ok: false,
        error: 'HTTP 500: Internal Server Error',
        source: 'live',
      });
    });

    it('should handle JSON parsing error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await safeFetch('/api/test', { allowLive: true });

      expect(result).toEqual({
        ok: false,
        error: 'Invalid JSON',
        source: 'live',
      });
    });
  });

  describe('convenience functions', () => {
    it('probeEndpoint should call safeFetch with probeOnly=true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await probeEndpoint('/api/test', 2000);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test?probe=1'),
        expect.objectContaining({
          method: 'HEAD',
        }),
      );
      expect(result.source).toBe('probe');
    });

    it('fetchLiveData should call safeFetch with allowLive=true', async () => {
      vi.mocked(require('@/env').env).NEXT_PUBLIC_LIVE_DATA = '1';
      const mockData = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchLiveData('/api/test', { timeout: 3000 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          next: { revalidate: 60 },
        }),
      );
      expect(result.source).toBe('live');
    });
  });

  describe('type guards', () => {
    it('isBlocked should correctly identify blocked results', () => {
      const blockedResult = { ok: false, blocked: true, error: 'test' };
      const successResult = { ok: true, data: {} };

      expect(isBlocked(blockedResult)).toBe(true);
      expect(isBlocked(successResult)).toBe(false);
    });

    it('isSuccess should correctly identify successful results', () => {
      const successResult = { ok: true, data: { test: 'data' } };
      const errorResult = { ok: false, error: 'test' };

      expect(isSuccess(successResult)).toBe(true);
      expect(isSuccess(errorResult)).toBe(false);
    });
  });

  describe('environment matrix', () => {
    const testCases = [
      {
        name: 'live disabled, probe disabled',
        env: { NEXT_PUBLIC_LIVE_DATA: '0', NEXT_PUBLIC_PROBE_MODE: '0' },
        options: { allowLive: true, probeOnly: false },
        expected: { blocked: true, source: 'blocked' },
      },
      {
        name: 'live disabled, probe enabled',
        env: { NEXT_PUBLIC_LIVE_DATA: '0', NEXT_PUBLIC_PROBE_MODE: '1' },
        options: { allowLive: false, probeOnly: true },
        expected: { source: 'probe' },
      },
      {
        name: 'live enabled, allowLive true',
        env: { NEXT_PUBLIC_LIVE_DATA: '1', NEXT_PUBLIC_PROBE_MODE: '1' },
        options: { allowLive: true, probeOnly: false },
        expected: { source: 'live' },
      },
    ];

    testCases.forEach(({ name, env: envVars, options, expected }) => {
      it(`should handle ${name}`, async () => {
        vi.mocked(require('@/env').env).NEXT_PUBLIC_LIVE_DATA = envVars.NEXT_PUBLIC_LIVE_DATA;
        vi.mocked(require('@/env').env).NEXT_PUBLIC_PROBE_MODE = envVars.NEXT_PUBLIC_PROBE_MODE;

        if (expected.source === 'probe' || expected.source === 'live') {
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({}),
          });
        }

        const result = await safeFetch('/api/test', options);

        expect(result.source).toBe(expected.source);
        if (expected.blocked) {
          expect(result.blocked).toBe(true);
        }
      });
    });
  });
});
