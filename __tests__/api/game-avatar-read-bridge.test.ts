import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  avatarConfiguration: { findFirst: vi.fn() },
  user: { findUnique: vi.fn() },
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@/lib/db', () => ({
  db: {
    avatarConfiguration: mocks.avatarConfiguration,
    user: mocks.user,
  },
}));
vi.mock('@/app/lib/request-id', () => ({ generateRequestId: () => 'request-id' }));
vi.mock('@/app/lib/rate-limit', () => ({
  RATE_LIMITS: { AVATAR_LOAD: {} },
  createRateLimitMiddleware: () => async () => null,
}));

describe('game avatar read authority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('rejects unauthenticated reads before querying private avatar data', async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    const { GET } = await import('@/app/api/v1/avatar/load/route');
    const response = await GET(new NextRequest('https://www.otaku-mori.com/api/v1/avatar/load'));

    expect(response.status).toBe(401);
    expect(mocks.user.findUnique).not.toHaveBeenCalled();
    expect(mocks.avatarConfiguration.findFirst).not.toHaveBeenCalled();
  });

  it('returns only the current viewer active avatar read model', async () => {
    mocks.auth.mockResolvedValue({ userId: 'clerk_user_123' });
    mocks.user.findUnique.mockResolvedValue({
      id: 'local_user_123',
      username: 'wanderer',
      displayName: 'Wanderer',
      nsfwEnabled: false,
    });
    mocks.avatarConfiguration.findFirst.mockResolvedValue({
      id: 'avatar_config_123',
      configurationData: {
        body: { type: 'default', height: 1, weight: 1, proportions: {} },
        hair: { style: 'default', length: 0.5, color: { primary: '#3d2817' } },
        outfit: { type: 'casual', color: { primary: '#666666' } },
        accessories: ['adult-hidden', 'ribbon'],
        colors: {
          skin: '#ffdbac',
          hair: '#3d2817',
          eyes: '#4a5568',
          outfit: '#666666',
          accent: '#ab6366',
        },
        nsfwEnabled: false,
        version: 1,
      },
      glbUrl: null,
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const { GET } = await import('@/app/api/v1/avatar/load/route');
    const response = await GET(new NextRequest('https://www.otaku-mori.com/api/v1/avatar/load'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(mocks.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'clerk_user_123' } }),
    );
    expect(mocks.avatarConfiguration.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'local_user_123' } }),
    );
    expect(body.data).toMatchObject({
      avatarId: 'avatar_config_123',
      displayName: 'Wanderer',
      config: { accessories: ['ribbon'], nsfwEnabled: false },
    });
    expect(body.data).not.toHaveProperty('userId');
  });
});
