import { beforeEach, describe, expect, it, vi } from 'vitest';

const authorizeAdminApiMock = vi.fn();
const envMock: Record<string, string | undefined> = {
  NODE_ENV: 'test',
  STAGING_CATALOG_SYNC_ENABLED: undefined,
};

vi.mock('@/env', () => ({
  get env() {
    return envMock;
  },
}));

vi.mock('@/app/lib/auth/admin', () => ({
  authorizeAdminApi: authorizeAdminApiMock,
}));

async function authorize(
  options: Parameters<typeof import('../providerWriteGuard').authorizeProviderWrite>[1] = {},
) {
  const { authorizeProviderWrite } = await import('../providerWriteGuard');
  return authorizeProviderWrite(
    new Request('https://otaku-mori.test/api/provider-write', { method: 'POST' }),
    options,
  );
}

describe('authorizeProviderWrite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    envMock.NODE_ENV = 'test';
    envMock.STAGING_CATALOG_SYNC_ENABLED = undefined;
  });

  it('rejects an unauthenticated request', async () => {
    const response = Response.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });
    authorizeAdminApiMock.mockResolvedValue({ ok: false, response });

    const result = await authorize();

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(401);
    expect(authorizeAdminApiMock).toHaveBeenCalledWith(
      expect.any(Request),
      'clerk_admin_or_internal_service',
    );
  });

  it('accepts an authorized internal service', async () => {
    authorizeAdminApiMock.mockResolvedValue({ ok: true, principal: 'internal_service' });

    await expect(authorize()).resolves.toEqual({
      ok: true,
      principal: 'internal_service',
    });
  });

  it.each([undefined, 'false'])('fails closed when the required flag is %s', async (value) => {
    envMock.STAGING_CATALOG_SYNC_ENABLED = value;

    const result = await authorize({
      requireEnvFlag: 'STAGING_CATALOG_SYNC_ENABLED',
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(403);
    expect(authorizeAdminApiMock).not.toHaveBeenCalled();
  });

  it('allows a development-only route in development without provider auth', async () => {
    envMock.NODE_ENV = 'development';

    await expect(authorize({ developmentOnly: true })).resolves.toEqual({
      ok: true,
      principal: 'internal_service',
    });
    expect(authorizeAdminApiMock).not.toHaveBeenCalled();
  });

  it('requires authorization for a development-only route outside development', async () => {
    const response = Response.json({ ok: false, error: 'AUTH_REQUIRED' }, { status: 401 });
    authorizeAdminApiMock.mockResolvedValue({ ok: false, response });

    const result = await authorize({ developmentOnly: true });

    expect(result.ok).toBe(false);
    expect(authorizeAdminApiMock).toHaveBeenCalledTimes(1);
  });
});
