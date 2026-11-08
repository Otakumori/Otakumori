import { describe, expect, it } from 'vitest';

import {
  PREVIEW_DATABASE_ISOLATION_ERROR,
  PREVIEW_REDIS_ISOLATION_ERROR,
  assertPreviewDatabaseIsolation,
  assertPreviewRedisIsolation,
  isPreviewExternalMutationRequest,
  isVercelPreview,
} from '@/app/lib/security/previewIsolation';

const previewEnvironment = {
  VERCEL: '1',
  VERCEL_ENV: 'preview',
};

describe('Preview credential and database isolation', () => {
  it('does not activate from a browser URL or host without Vercel Preview runtime state', () => {
    expect(isVercelPreview({ VERCEL_URL: 'forged-preview.example.com' })).toBe(false);
    expect(isPreviewExternalMutationRequest('/api/webhooks/stripe', 'POST', {})).toBe(false);
  });

  it('blocks provider mutations but permits read-only requests in Vercel Preview', () => {
    expect(
      isPreviewExternalMutationRequest(
        '/api/admin/printify/products/123',
        'PATCH',
        previewEnvironment,
      ),
    ).toBe(true);
    expect(
      isPreviewExternalMutationRequest(
        '/api/admin/printify/products/123',
        'GET',
        previewEnvironment,
      ),
    ).toBe(false);
    expect(
      isPreviewExternalMutationRequest('/api/webhooks/clerk', 'POST', previewEnvironment),
    ).toBe(true);
    expect(
      isPreviewExternalMutationRequest('/api/storage/upload-url', 'POST', previewEnvironment),
    ).toBe(true);
  });

  it('fails closed when Preview database credentials are absent', () => {
    expect(() => assertPreviewDatabaseIsolation(previewEnvironment)).toThrow(
      PREVIEW_DATABASE_ISOLATION_ERROR,
    );
  });

  it('fails closed when pooled and unpooled Preview database targets differ', () => {
    expect(() =>
      assertPreviewDatabaseIsolation({
        ...previewEnvironment,
        DATABASE_URL: 'postgresql://user:pass@ep-preview-pooler.example/neondb',
        DATABASE_URL_UNPOOLED: 'postgresql://user:pass@ep-main.example/neondb',
      }),
    ).toThrow(PREVIEW_DATABASE_ISOLATION_ERROR);
  });

  it('accepts matching pooled and unpooled Neon child targets for neondb', () => {
    expect(() =>
      assertPreviewDatabaseIsolation({
        ...previewEnvironment,
        DATABASE_URL: 'postgresql://user:pass@ep-preview-pooler.example/neondb',
        DATABASE_URL_UNPOOLED: 'postgresql://user:pass@ep-preview.example/neondb',
      }),
    ).not.toThrow();
  });

  it('refuses Redis access until Preview isolation is explicitly asserted', () => {
    expect(() => assertPreviewRedisIsolation(previewEnvironment)).toThrow(
      PREVIEW_REDIS_ISOLATION_ERROR,
    );
    expect(() =>
      assertPreviewRedisIsolation({
        ...previewEnvironment,
        OTM_PREVIEW_REDIS_ISOLATED: '1',
      }),
    ).not.toThrow();
  });
});
