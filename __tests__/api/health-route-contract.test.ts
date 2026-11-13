import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ queryRaw: vi.fn() }));

vi.mock('@/server/db', () => ({ prisma: { $queryRaw: mocks.queryRaw } }));

import { GET } from '@/app/api/health/route';

describe('database-backed public readiness contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns healthy 200 with no-store only after a successful database query', async () => {
    mocks.queryRaw.mockResolvedValue([{ result: 1 }]);
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({ ok: true, status: 'healthy' });
    expect(mocks.queryRaw).toHaveBeenCalledTimes(1);
  });

  it.each(['true', 'false'])('returns a sanitized 503 on query failure when CI=%s', async (ci) => {
    vi.stubEnv('CI', ci);
    try {
      mocks.queryRaw.mockRejectedValue(new Error('sensitive_host_name.example:5432 secret fixture'));
      const response = await GET();
      const payload = await response.json();

      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toBe('no-store');
      expect(payload).toEqual({
        ok: false,
        status: 'unhealthy',
        code: 'DATABASE_UNAVAILABLE',
      });
      expect(JSON.stringify(payload)).not.toMatch(/sensitive_host_name|secret fixture/);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
