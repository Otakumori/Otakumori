import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  getEffectiveFeatureFlags: vi.fn(),
  getSiteSettingsMap: vi.fn(),
  upsertSiteSetting: vi.fn(),
  syncInventory: vi.fn(),
  getInventoryStatus: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@/env', () => ({ env: {} }));
vi.mock('@/app/lib/config/featureFlags.server', () => ({
  getEffectiveFeatureFlags: mocks.getEffectiveFeatureFlags,
}));
vi.mock('@/app/lib/config/siteSettings.server', () => ({
  getSiteSettingsMap: mocks.getSiteSettingsMap,
  upsertSiteSetting: mocks.upsertSiteSetting,
}));
vi.mock('@/app/lib/printify/advanced-service', () => ({
  getAdvancedPrintifyService: () => ({
    syncInventory: mocks.syncInventory,
    getInventoryStatus: mocks.getInventoryStatus,
  }),
}));
vi.mock('@/app/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { GET as debugPrintify } from '@/app/api/debug/printify/route';
import {
  GET as getFeatureFlags,
  POST as updateFeatureFlag,
} from '@/app/api/v1/admin/feature-flags/route';
import { GET as getInventory, POST as syncInventory } from '@/app/api/v1/printify/inventory/route';

const request = (url: string, init?: RequestInit) => new NextRequest(url, init);

describe('P0 privileged route boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ userId: null, sessionClaims: null });
    mocks.getEffectiveFeatureFlags.mockResolvedValue({
      AVATARS_ENABLED: true,
      REQUIRE_AUTH_FOR_MINI_GAMES: false,
      NSFW_AVATARS_ENABLED: false,
      HOMEPAGE_EXPERIMENTAL_ENABLED: true,
    });
    mocks.getSiteSettingsMap.mockResolvedValue({});
    mocks.upsertSiteSetting.mockResolvedValue({ key: 'AVATARS_ENABLED', boolValue: false });
    mocks.syncInventory.mockResolvedValue([]);
    mocks.getInventoryStatus.mockResolvedValue({ totalProducts: 0 });
  });

  it('denies anonymous and ordinary users before Printify diagnostics execute', async () => {
    const anonymous = await debugPrintify(request('https://example.com/api/debug/printify'));
    expect(anonymous.status).toBe(401);

    mocks.auth.mockResolvedValue({ userId: 'user_1', sessionClaims: {} });
    const ordinary = await debugPrintify(request('https://example.com/api/debug/printify'));
    expect(ordinary.status).toBe(403);
    expect(mocks.syncInventory).not.toHaveBeenCalled();
    expect(mocks.getInventoryStatus).not.toHaveBeenCalled();
  });

  it('returns no provider configuration or payload in the non-development diagnostic surface', async () => {
    mocks.auth.mockResolvedValue({
      userId: 'admin_1',
      sessionClaims: { metadata: { role: 'admin' } },
    });
    const response = await debugPrintify(request('https://example.com/api/debug/printify'));
    const body = await response.text();

    expect(response.status).toBe(404);
    expect(body).not.toMatch(/api[_-]?key|shop[_-]?id|authorization|headers|stack/i);
  });

  it('denies non-admin flag reads and writes before persistence', async () => {
    expect((await getFeatureFlags()).status).toBe(401);

    mocks.auth.mockResolvedValue({ userId: 'user_1', sessionClaims: {} });
    expect((await getFeatureFlags()).status).toBe(403);

    const response = await updateFeatureFlag(
      request('https://example.com/api/v1/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify({ key: 'AVATARS_ENABLED', boolValue: false }),
      }),
    );
    expect(response.status).toBe(403);
    expect(mocks.upsertSiteSetting).not.toHaveBeenCalled();
  });

  it('persists an authorized flag mutation with server-derived admin identity', async () => {
    mocks.auth.mockResolvedValue({
      userId: 'admin_1',
      sessionClaims: { public_metadata: { role: 'admin' } },
    });
    const response = await updateFeatureFlag(
      request('https://example.com/api/v1/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify({
          key: 'AVATARS_ENABLED',
          boolValue: false,
          updatedBy: 'forged_user',
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.upsertSiteSetting).toHaveBeenCalledWith(
      'AVATARS_ENABLED',
      { boolValue: false },
      'admin_1',
    );

    mocks.getEffectiveFeatureFlags.mockResolvedValue({
      AVATARS_ENABLED: false,
      REQUIRE_AUTH_FOR_MINI_GAMES: false,
      NSFW_AVATARS_ENABLED: false,
      HOMEPAGE_EXPERIMENTAL_ENABLED: true,
    });
    mocks.getSiteSettingsMap.mockResolvedValue({
      AVATARS_ENABLED: { boolValue: false },
    });
    const freshRead = await getFeatureFlags();
    expect(freshRead.status).toBe(200);
    expect((await freshRead.json()).data.effectiveFlags.AVATARS_ENABLED).toBe(false);
  });

  it('reports persistence failure instead of false flag success', async () => {
    mocks.auth.mockResolvedValue({
      userId: 'admin_1',
      sessionClaims: { metadata: { role: 'admin' } },
    });
    mocks.upsertSiteSetting.mockRejectedValue(new Error('write failed'));

    const response = await updateFeatureFlag(
      request('https://example.com/api/v1/admin/feature-flags', {
        method: 'POST',
        body: JSON.stringify({ key: 'AVATARS_ENABLED', boolValue: false }),
      }),
    );
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ ok: false, error: 'Internal server error' });
  });

  it('rejects inventory reads and mutations before any provider call', async () => {
    const mutation = await syncInventory(
      request('https://example.com/api/v1/printify/inventory', { method: 'POST' }),
    );
    expect(mutation.status).toBe(401);

    mocks.auth.mockResolvedValue({ userId: 'user_1', sessionClaims: {} });
    const ordinaryMutation = await syncInventory(
      request('https://example.com/api/v1/printify/inventory', { method: 'POST' }),
    );
    const read = await getInventory(request('https://example.com/api/v1/printify/inventory'));
    expect(ordinaryMutation.status).toBe(403);
    expect(read.status).toBe(403);
    expect(mocks.syncInventory).not.toHaveBeenCalled();
    expect(mocks.getInventoryStatus).not.toHaveBeenCalled();
  });

  it('allows an admin to reach the mocked inventory sync path', async () => {
    mocks.auth.mockResolvedValue({
      userId: 'admin_1',
      sessionClaims: { metadata: { role: 'admin' } },
    });
    mocks.syncInventory.mockResolvedValue([{ variantId: 'variant_1', available: true }]);

    const response = await syncInventory(
      request('https://example.com/api/v1/printify/inventory', { method: 'POST' }),
    );
    expect(response.status).toBe(200);
    expect(mocks.syncInventory).toHaveBeenCalledOnce();
  });
});
