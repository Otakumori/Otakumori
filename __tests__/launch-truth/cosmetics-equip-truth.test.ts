import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const findUserMock = vi.fn();
const findInventoryMock = vi.fn();
const updateUserMock = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({ auth: authMock }));
vi.mock('@/lib/db', () => ({
  db: {
    user: { findUnique: findUserMock, update: updateUserMock },
    inventoryItem: { findFirst: findInventoryMock },
  },
}));
vi.mock('@/app/lib/policy/fromRequest', () => ({
  getPolicyFromRequest: () => ({ nsfwAllowed: false }),
}));
vi.mock('@/app/lib/cosmetics/cosmeticsConfig', () => ({
  getCosmeticItem: (id: string) => ({ id, nsfw: false }),
  isNSFWCosmetic: () => false,
}));
vi.mock('@/lib/requestId', () => ({ generateRequestId: () => 'request-test' }));
vi.mock('@/app/lib/logger', () => ({ logger: { error: vi.fn() } }));

describe('canonical cosmetics equip truth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ userId: 'clerk-user' });
    findUserMock.mockResolvedValue({ id: 'local-user' });
    findInventoryMock.mockResolvedValue({ id: 'owned-item' });
    updateUserMock.mockResolvedValue({ id: 'local-user' });
  });

  it('rejects an unauthenticated request', async () => {
    authMock.mockResolvedValue({ userId: null });
    const { POST } = await import('@/app/api/v1/cosmetics/equip/route');
    const response = await POST(
      new Request('https://otaku-mori.test/api/v1/cosmetics/equip', {
        method: 'POST',
        body: JSON.stringify({ cosmetic: 'mask-01' }),
      }) as never,
    );

    expect(response.status).toBe(401);
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it('rejects an unowned cosmetic', async () => {
    findInventoryMock.mockResolvedValue(null);
    const { POST } = await import('@/app/api/v1/cosmetics/equip/route');
    const response = await POST(
      new Request('https://otaku-mori.test/api/v1/cosmetics/equip', {
        method: 'POST',
        body: JSON.stringify({ cosmetic: 'mask-01' }),
      }) as never,
    );

    expect(response.status).toBe(403);
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it('reports success only after persisted state changes', async () => {
    const { POST } = await import('@/app/api/v1/cosmetics/equip/route');
    const response = await POST(
      new Request('https://otaku-mori.test/api/v1/cosmetics/equip', {
        method: 'POST',
        body: JSON.stringify({ cosmetic: 'mask-01' }),
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(updateUserMock).toHaveBeenCalledWith({
      where: { id: 'local-user' },
      data: { activeCosmetic: 'mask-01' },
    });
  });

  it('cannot report success when persistence fails', async () => {
    updateUserMock.mockRejectedValue(new Error('write failed'));
    const { POST } = await import('@/app/api/v1/cosmetics/equip/route');
    const response = await POST(
      new Request('https://otaku-mori.test/api/v1/cosmetics/equip', {
        method: 'POST',
        body: JSON.stringify({ cosmetic: 'mask-01' }),
      }) as never,
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ ok: false, error: 'INTERNAL_ERROR' });
  });
});
