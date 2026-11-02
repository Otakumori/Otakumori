import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  block: { findUnique: vi.fn() },
  follow: { findUnique: vi.fn() },
  user: { findUnique: vi.fn() },
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: mocks.auth }));
vi.mock('@/lib/db', () => ({
  db: {
    block: mocks.block,
    follow: mocks.follow,
    user: mocks.user,
  },
}));
vi.mock('@/app/lib/logger', () => ({
  logger: { error: vi.fn() },
}));

import { GET, normalizeProfileVisibility } from '@/app/api/v1/profile/[username]/route';

describe('profile visibility authority', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.block.findUnique.mockResolvedValue(null);
    mocks.follow.findUnique.mockResolvedValue(null);
  });

  it.each([
    ['private', 'private'],
    ['PRIVATE', 'private'],
    [' friends ', 'friends'],
    ['FRIENDS', 'friends'],
    ['public', 'public'],
    ['PUBLIC', 'public'],
  ])('normalizes persisted %s visibility to %s', (persisted, expected) => {
    expect(normalizeProfileVisibility(persisted)).toBe(expected);
  });

  it('fails unknown legacy values closed to private', () => {
    expect(normalizeProfileVisibility('unknown')).toBe('private');
  });

  it('enforces lowercase private visibility for anonymous profile reads', async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    mocks.user.findUnique.mockResolvedValue({
      id: 'local_owner',
      clerkId: 'clerk_owner',
      visibility: 'private',
    });

    const response = await GET(
      new NextRequest('https://www.otaku-mori.com/api/v1/profile/owner'),
      { params: { username: 'owner' } },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      ok: false,
      error: 'Profile is private',
    });
  });

  it('enforces lowercase private visibility for another signed-in user', async () => {
    mocks.auth.mockResolvedValue({ userId: 'clerk_viewer' });
    mocks.user.findUnique.mockResolvedValue({
      id: 'local_owner',
      clerkId: 'clerk_owner',
      visibility: 'private',
    });

    const response = await GET(
      new NextRequest('https://www.otaku-mori.com/api/v1/profile/owner'),
      { params: { username: 'owner' } },
    );

    expect(response.status).toBe(403);
    expect(mocks.block.findUnique).toHaveBeenCalledTimes(2);
  });
});
