import { beforeEach, describe, expect, it, vi } from 'vitest';
import { creatorAvatarFixture } from '../fixtures/creator-avatar';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  checkIdempotency: vi.fn(),
  storeIdempotencyResponse: vi.fn(),
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth, currentUser: vi.fn() }));
vi.mock('@/lib/db', () => ({ db: { user: { findUnique: mocks.findUnique, update: mocks.update } } }));
vi.mock('@/app/lib/idempotency', () => ({
  checkIdempotency: mocks.checkIdempotency,
  storeIdempotencyResponse: mocks.storeIdempotencyResponse,
}));
vi.mock('@/app/lib/rate-limit', () => ({
  RATE_LIMITS: { AVATAR_SAVE: {} },
  createRateLimitMiddleware: () => async () => null,
}));
vi.mock('@/app/lib/request-id', () => ({ generateRequestId: () => 'request-id' }));
vi.mock('@/app/lib/logger', () => ({ logger: { error: vi.fn() } }));

describe('canonical creator persistence authority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue({ userId: 'clerk-user' });
    mocks.checkIdempotency.mockResolvedValue(null);
    mocks.findUnique.mockResolvedValue({
      id: 'local-user',
      avatarConfig: null,
      avatarBundle: { config: creatorAvatarFixture() },
      avatarRendering: '3d',
      username: 'traveler',
      displayName: 'Traveler',
      updatedAt: new Date(),
    });
    mocks.update.mockResolvedValue({ id: 'local-user', avatarConfig: {}, avatarBundle: {} });
  });

  it('denies anonymous reads and writes before database work', async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    const { GET } = await import('@/app/api/v1/creator/load/route');
    const { POST } = await import('@/app/api/v1/creator/save/route');

    expect((await GET(new Request('https://otaku-mori.test') as never)).status).toBe(401);
    expect(
      (
        await POST(
          new Request('https://otaku-mori.test', { method: 'POST' }) as never,
        )
      ).status,
    ).toBe(401);
    expect(mocks.findUnique).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('returns the stable canonical read shape through compatibility routes', async () => {
    const canonical = await import('@/app/api/v1/creator/load/route');
    const avatarCompatibility = await import('@/app/api/v1/avatar/load/route');
    const characterCompatibility = await import('@/app/api/v1/character/config/route');

    for (const handler of [canonical.GET, avatarCompatibility.GET, characterCompatibility.GET]) {
      const response = await handler(new Request('https://otaku-mori.test') as never);
      await expect(response.json()).resolves.toMatchObject({
        ok: true,
        data: { config: { id: 'avatar-test' }, avatarId: 'avatar-test', rendering: '3d' },
      });
    }
  });

  it('replays an idempotent save without issuing a second write', async () => {
    mocks.checkIdempotency.mockResolvedValue({ ok: true, data: { avatarId: 'avatar-test' } });
    const { POST } = await import('@/app/api/v1/creator/save/route');
    const response = await POST(
      new Request('https://otaku-mori.test', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-idempotency-key': 'same-save' },
        body: JSON.stringify(creatorAvatarFixture()),
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it('persists an authenticated semantic identity through the sole write authority', async () => {
    const { POST } = await import('@/app/api/v1/creator/save/route');
    const response = await POST(
      new Request('https://otaku-mori.test', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-idempotency-key': 'first-save' },
        body: JSON.stringify(creatorAvatarFixture()),
      }) as never,
    );

    expect(response.status).toBe(200);
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkId: 'clerk-user' },
        data: expect.objectContaining({
          avatarBundle: expect.objectContaining({
            config: expect.objectContaining({
              baseAssetId: 'female_base_v1',
              animationSetId: 'humanoid_idle_v1',
              parts: expect.objectContaining({ OuterWear: 'commander_combat_01' }),
            }),
          }),
        }),
      }),
    );
    expect(mocks.storeIdempotencyResponse).toHaveBeenCalledOnce();
  });

  it('round-trips one identity from Creator save through reload consumers', async () => {
    const input = creatorAvatarFixture({
      body: { ...creatorAvatarFixture().body, height: 1.12 },
      face: { ...creatorAvatarFixture().face, jawline: 0.72 },
      skin: { ...creatorAvatarFixture().skin, tone: '#d9a38f' },
    });
    let persistedBundle: unknown = null;
    mocks.update.mockImplementation(async ({ data }: { data: { avatarBundle: unknown } }) => {
      persistedBundle = data.avatarBundle;
      return { id: 'local-user', avatarConfig: data, avatarBundle: data.avatarBundle };
    });

    const { POST } = await import('@/app/api/v1/creator/save/route');
    const saveResponse = await POST(
      new Request('https://otaku-mori.test', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-idempotency-key': 'roundtrip-save' },
        body: JSON.stringify(input),
      }) as never,
    );
    expect(saveResponse.status).toBe(200);

    mocks.findUnique.mockResolvedValue({
      id: 'local-user',
      avatarConfig: null,
      avatarBundle: persistedBundle,
      avatarRendering: '3d',
      username: 'traveler',
      displayName: 'Traveler',
      updatedAt: new Date(),
    });
    const { GET } = await import('@/app/api/v1/creator/load/route');
    const loadResponse = await GET(new Request('https://otaku-mori.test') as never);
    const loaded = await loadResponse.json();

    expect(loaded.data.config).toMatchObject({
      baseAssetId: 'female_base_v1',
      body: { height: 1.12 },
      face: { jawline: 0.72 },
      hair: { style: 'medium_wolf_01' },
      parts: { OuterWear: 'commander_combat_01' },
      skin: { tone: '#d9a38f' },
    });
  });

  it('returns an intentional empty identity when none has been saved', async () => {
    mocks.findUnique.mockResolvedValue({
      id: 'local-user',
      avatarConfig: null,
      avatarBundle: null,
      avatarRendering: null,
      username: 'traveler',
      displayName: 'Traveler',
      updatedAt: new Date(),
    });
    const { GET } = await import('@/app/api/v1/creator/load/route');
    const response = await GET(new Request('https://otaku-mori.test') as never);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: { config: null, avatarId: null },
    });
  });

  it('cannot report success when persistence fails', async () => {
    mocks.update.mockRejectedValue(new Error('write failed'));
    const { POST } = await import('@/app/api/v1/creator/save/route');
    const response = await POST(
      new Request('https://otaku-mori.test', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-idempotency-key': 'failed-save' },
        body: JSON.stringify(creatorAvatarFixture()),
      }) as never,
    );

    expect(response.status).toBe(500);
    expect(mocks.storeIdempotencyResponse).not.toHaveBeenCalled();
  });

  it('retires the second persisted write endpoint', async () => {
    const { POST } = await import('@/app/api/v1/character/config/route');
    const response = await POST();
    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      canonical: '/api/v1/creator/save',
    });
  });
});
