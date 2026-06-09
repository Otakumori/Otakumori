import { beforeEach, describe, expect, it, vi } from 'vitest';

const clerk = vi.hoisted(() => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => clerk);
vi.mock('next/navigation', () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));
vi.mock('@/env', () => ({
  env: {
    ADMIN_EMAILS: 'configured-admin@example.test',
    INTERNAL_AUTH_TOKEN: 'internal-test-token',
    API_KEY: 'legacy-api-token',
  },
}));

import { authorizeAdminApi } from '@/app/lib/auth/admin';

function user(email: string, role?: string) {
  return {
    primaryEmailAddress: { emailAddress: email },
    emailAddresses: [{ emailAddress: email }],
    publicMetadata: role ? { role } : {},
    privateMetadata: {},
  };
}

describe('shared admin authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clerk.auth.mockResolvedValue({ userId: null });
    clerk.currentUser.mockResolvedValue(null);
  });

  it('rejects unauthenticated Clerk requests', async () => {
    const result = await authorizeAdminApi();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
  });

  it('preserves configured email and owner fallback access', async () => {
    clerk.auth.mockResolvedValue({ userId: 'user_owner' });
    clerk.currentUser.mockResolvedValue(user('ap1903@hotmail.com'));

    await expect(authorizeAdminApi()).resolves.toEqual(
      expect.objectContaining({ ok: true, principal: 'clerk_admin', userId: 'user_owner' }),
    );
  });

  it('accepts approved Clerk admin metadata', async () => {
    clerk.auth.mockResolvedValue({ userId: 'user_metadata' });
    clerk.currentUser.mockResolvedValue(user('staff@example.test', 'admin'));

    await expect(authorizeAdminApi()).resolves.toEqual(
      expect.objectContaining({ ok: true, principal: 'clerk_admin' }),
    );
  });

  it('supports internal automation without invoking Clerk', async () => {
    const request = new Request('https://preview.test/api/admin/maintenance', {
      headers: { authorization: 'Bearer internal-test-token' },
    });

    await expect(authorizeAdminApi(request, 'internal_service')).resolves.toEqual(
      expect.objectContaining({ ok: true, principal: 'internal_service', userId: null }),
    );
    expect(clerk.auth).not.toHaveBeenCalled();
  });

  it('rejects invalid internal automation credentials', async () => {
    const request = new Request('https://preview.test/api/admin/maintenance', {
      headers: { 'x-api-key': 'incorrect' },
    });
    const result = await authorizeAdminApi(request, 'internal_service');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
  });
});
