import { beforeEach, describe, expect, it, vi } from 'vitest';
import { creatorAvatarFixture } from '../fixtures/creator-avatar';

const mocks = vi.hoisted(() => ({ auth: vi.fn(), findUnique: vi.fn() }));

vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@/lib/db', () => ({ db: { user: { findUnique: mocks.findUnique } } }));
vi.mock('@/app/lib/request-id', () => ({ generateRequestId: () => 'request-id' }));
vi.mock('@/app/lib/logger', () => ({ logger: { error: vi.fn() } }));

describe('game avatar compatibility read bridge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('rejects unauthenticated reads before querying private avatar data', async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    const { GET } = await import('@/app/api/v1/avatar/load/route');
    const response = await GET(new Request('https://otaku-mori.test/api/v1/avatar/load') as never);

    expect(response.status).toBe(401);
    expect(mocks.findUnique).not.toHaveBeenCalled();
  });

  it('returns the current viewer canonical creator identity', async () => {
    mocks.auth.mockResolvedValue({ userId: 'clerk-user' });
    mocks.findUnique.mockResolvedValue({
      id: 'local-user',
      username: 'traveler',
      displayName: 'Traveler',
      avatarConfig: null,
      avatarBundle: { config: creatorAvatarFixture() },
      avatarRendering: '3d',
      updatedAt: new Date(),
    });
    const { GET } = await import('@/app/api/v1/avatar/load/route');
    const response = await GET(new Request('https://otaku-mori.test/api/v1/avatar/load') as never);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'clerk-user' } }),
    );
    expect(body.data).toMatchObject({
      avatarId: 'avatar-test',
      config: { id: 'avatar-test', baseAssetId: 'female_base_v1' },
      rendering: '3d',
    });
  });
});
