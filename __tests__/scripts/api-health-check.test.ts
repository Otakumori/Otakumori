import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APIHealthChecker } from '@/scripts/api-health-check';

function fakeResponse(status: number, payload: Record<string, unknown>): Response {
  return {
    status,
    clone: () => ({
      json: async () => payload,
      text: async () => JSON.stringify(payload),
    }),
  } as unknown as Response;
}

describe('API health release gate', () => {
  beforeEach(() => {
    vi.stubEnv('CI', 'true');
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it.each([
    [500, { ok: false, status: 'failed' }, 1],
    [200, { ok: true, status: 'degraded' }, 1],
    [200, { ok: false, status: 'healthy' }, 1],
    [200, { ok: true, status: 'healthy' }, 0],
  ] as const)('treats HTTP %i with payload %j as %i failures', async (status, payload, failures) => {
    const mockFetch = vi.fn().mockResolvedValue(fakeResponse(status, payload));
    vi.stubGlobal('fetch', mockFetch);

    const checker = new APIHealthChecker('http://localhost:3000');
    await checker.runAllTests();

    expect(checker.getFailedCount()).toBe(failures);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/health',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('fails closed on a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('simulated outage')));
    const checker = new APIHealthChecker();
    await checker.runAllTests();
    expect(checker.getFailedCount()).toBe(1);
  });
});
