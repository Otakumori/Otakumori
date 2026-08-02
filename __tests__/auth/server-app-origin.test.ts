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

  it('prefers the exact HTTPS staging alias for Preview requests received through staging', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    vi.stubEnv('VERCEL_URL', 'otaku-mori-fallback.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'staging.otaku-mori.com',
      'x-forwarded-proto': 'https',
    });

    await expect(resolveServerAppOrigin()).resolves.toBe('https://staging.otaku-mori.com');
  });

  it('prefers the exact HTTPS PR #73 Preview alias before Vercel branch metadata', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');
    vi.stubEnv('VERCEL_URL', 'otaku-mori-fallback.vercel.app');
    mockRequestHeaders({
      'x-forwarded-host': 'PR73-Preview.Otaku-Mori.Com',
      'x-forwarded-proto': 'https',
    });

    await expect(resolveServerAppOrigin()).resolves.toBe('https://pr73-preview.otaku-mori.com');
  });

  it('does not use trusted Preview aliases for HTTP, variant, port, or contaminated hosts', async () => {
    vi.stubEnv('VERCEL_ENV', 'preview');
    vi.stubEnv('VERCEL_BRANCH_URL', 'otaku-mori-git-auth-otaku-mori-babe.vercel.app');

    for (const headers of [
      { 'x-forwarded-host': 'staging.otaku-mori.com', 'x-forwarded-proto': 'http' },
      { 'x-forwarded-host': 'staging.otaku-mori.com:443', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': 'evil.staging.otaku-mori.com', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': 'staging.otaku-mori.com.evil.example', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': 'preview.otaku-mori.com', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': 'user:pass@staging.otaku-mori.com', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': 'staging.otaku-mori.com/path', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': ' staging.otaku-mori.com ', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': 'staging.otaku-mori.com, evil.example', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': 'evil.example, staging.otaku-mori.com', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': 'staging.otaku-mori.com', 'x-forwarded-proto': 'https, http' },
      { 'x-forwarded-host': 'staging.otaku-mori.com\r\nx-evil: yes', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': 'pr73-preview.otaku-mori.com', 'x-forwarded-proto': 'http' },
      { 'x-forwarded-host': 'pr73-preview.otaku-mori.com:443', 'x-forwarded-proto': 'https' },
      { 'x-forwarded-host': 'pr74-preview.otaku-mori.com', 'x-forwarded-proto': 'https' },
      {
        'x-forwarded-host': 'pr73-preview.otaku-mori.com.attacker.example',
        'x-forwarded-proto': 'https',
      },
      { 'x-forwarded-host': 'evil-pr73-preview.otaku-mori.com', 'x-forwarded-proto': 'https' },
      {
        'x-forwarded-host': 'pr73-preview.otaku-mori.com, evil.example',
        'x-forwarded-proto': 'https',
      },
      {
        'x-forwarded-host': 'user:pass@pr73-preview.otaku-mori.com',
        'x-forwarded-proto': 'https',
      },
    ]) {
      mockRequestHeaders(headers);

      await expect(resolveServerAppOrigin()).resolves.toBe(
        'https://otaku-mori-git-auth-otaku-mori-babe.vercel.app',
      );
    }
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
    const { normalizeStagingPreviewOrigin, normalizeVercelPreviewOrigin } =
      serverAppOriginTestInternals;

    expect(normalizeVercelPreviewOrigin('otaku-mori.vercel.app')).toBe(
      'https://otaku-mori.vercel.app',
    );
    expect(normalizeVercelPreviewOrigin('otaku-mori.vercel.app/path')).toBeNull();
    expect(normalizeVercelPreviewOrigin('user:pass@otaku-mori.vercel.app')).toBeNull();
    expect(normalizeVercelPreviewOrigin('otaku-mori.vercel.app:443')).toBeNull();
    expect(normalizeStagingPreviewOrigin('staging.otaku-mori.com', 'https')).toBe(
      'https://staging.otaku-mori.com',
    );
    expect(normalizeStagingPreviewOrigin('staging.otaku-mori.com:443', 'https')).toBeNull();
    expect(normalizeStagingPreviewOrigin('pr73-preview.otaku-mori.com', 'https')).toBe(
      'https://pr73-preview.otaku-mori.com',
    );
  });
});
