import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const grantPetalsMock = vi.fn();
const authorizeAdminApiMock = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: authMock,
}));

vi.mock('@/app/lib/petals/grant', () => ({
  grantPetals: grantPetalsMock,
  // Re-exported type usage only; runtime value not needed.
}));

vi.mock('@/app/lib/auth/admin', () => ({
  authorizeAdminApi: authorizeAdminApiMock,
}));

vi.mock('@/app/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

async function callGrant(body: unknown) {
  const { POST } = await import('../grant/route');
  const request = new Request('https://otaku-mori.test/api/v1/petals/grant', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return POST(request as unknown as Parameters<typeof POST>[0]);
}

describe('/api/v1/petals/grant admin_grant authority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: 'user_regular' });
    grantPetalsMock.mockResolvedValue({
      success: true,
      granted: 10,
      newBalance: 10,
      lifetimeEarned: 10,
    });
  });

  it('rejects admin_grant for a non-admin caller before granting', async () => {
    const forbidden = new Response(JSON.stringify({ ok: false, error: 'FORBIDDEN' }), {
      status: 403,
    });
    authorizeAdminApiMock.mockResolvedValue({ ok: false, response: forbidden });

    const response = await callGrant({ amount: 1000, source: 'admin_grant' });

    expect(response.status).toBe(403);
    expect(authorizeAdminApiMock).toHaveBeenCalledWith(
      expect.anything(),
      'clerk_admin_or_internal_service',
    );
    expect(grantPetalsMock).not.toHaveBeenCalled();
  });

  it('allows admin_grant for an authorized admin/internal principal', async () => {
    authorizeAdminApiMock.mockResolvedValue({ ok: true, principal: 'internal_service' });

    const response = await callGrant({ amount: 1000, source: 'admin_grant' });

    expect(response.status).toBe(200);
    expect(grantPetalsMock).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'admin_grant', amount: 1000 }),
    );
  });

  it('does not require admin auth for a normal source', async () => {
    const response = await callGrant({ amount: 25, source: 'mini_game' });

    expect(response.status).toBe(200);
    expect(authorizeAdminApiMock).not.toHaveBeenCalled();
    expect(grantPetalsMock).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'mini_game', amount: 25 }),
    );
  });
});
