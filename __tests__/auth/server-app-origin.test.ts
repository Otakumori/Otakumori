import { headers } from 'next/headers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  resolveServerAppOrigin,
  serverAppOriginTestInternals,
} from '@/app/lib/auth/serverAppOrigin';

vi.mock('server-only', () => ({}));

const mockedHeaders = vi.mocked(headers);

function mockRequestHeaders(values: Record<string, string | null>) {
  mockedHeaders.mockResolvedValue({
    get: (name: string) => values[name.toLowerCase()] ?? null,
  } as Awaited<ReturnType<typeof headers>>);
}

describe('trusted server application origin', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
    mockRequestHeaders({});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('uses canonical Production origin in Vercel Production', async () => {
    vi.stubEnv('VERCEL_ENV', 'production');
    vi.stubEnv('VERCEL_URL', 'otaku-mori-random.vercel.app');

    await expect(resolveServerAppOrigin()).resolves.toBe('https://www.otaku-mori.com');
  });

  it('prefers VERCEL_BRANCH_URL for trusted Vercel Preview origins', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    vi.stubEnv('VERCEL_URL', 'otaku-mori-fallback.vercel.app');

    await expect(resolveServerAppOrigin()).resolves.toBe(
      'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app',
    );
  });

  it('falls back to VERCEL_URL when the Preview branch URL is absent', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_URL', 'otaku-mori-fallback.vercel.app');

    await expect(resolveServerAppOrigin()).resolves.toBe('https://otaku-mori-fallback.vercel.app');
  });

  it('rejects invalid Preview metadata and falls back to Production', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');

    for (const value of [
      'https://evil.example',
      'http://otaku-mori.vercel.app',
      'otaku-mori.vercel.app/path',
      'user:pass@otaku-mori.vercel.app',
      'otaku-mori.vercel.app:4443',
      'not a host',
    ]) {
      vi.stubEnv('VERCEL_BRANCH_URL', value);
      vi.stubEnv('VERCEL_URL', value);

      await expect(resolveServerAppOrigin()).resolves.toBe('https://www.otaku-mori.com');
    }
  });

  it('preserves trusted local request origins and ports outside Vercel', async () => {
    for (const [host, expected] of [
      ['localhost:3000', 'http://localhost:3000'],
      ['127.0.0.1:4173', 'http://127.0.0.1:4173'],
      ['[::1]:3000', 'http://[::1]:3000'],
    ]) {
      mockRequestHeaders({ host, 'x-forwarded-proto': 'http' });

      await expect(resolveServerAppOrigin()).resolves.toBe(expected);
    }
  });

  it('rejects non-local request Host headers', async () => {
    mockRequestHeaders({
      host: 'preview-auth.example.com',
      'x-forwarded-proto': 'https',
    });

    await expect(resolveServerAppOrigin()).resolves.toBe('https://www.otaku-mori.com');
  });

  it('normalizes helper internals without accepting paths, credentials, or ports', () => {
    const { normalizeVercelPreviewOrigin } = serverAppOriginTestInternals;

    expect(normalizeVercelPreviewOrigin('otaku-mori.vercel.app')).toBe(
      'https://otaku-mori.vercel.app',
    );
    expect(normalizeVercelPreviewOrigin('otaku-mori.vercel.app/path')).toBeNull();
    expect(normalizeVercelPreviewOrigin('user:pass@otaku-mori.vercel.app')).toBeNull();
    expect(normalizeVercelPreviewOrigin('otaku-mori.vercel.app:443')).toBeNull();
  });
});
