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
vi.mock('@/app/lib/logger', () => ({ logger: { error: vi.fn() } }));

import { GET, normalizeProfileVisibility } from '@/app/api/v1/profile/[username]/route';

const profileUser = {
  id: 'local_owner',
  clerkId: 'clerk_owner',
  username: 'owner',
  displayName: 'Owner Name',
  bio: null,
  location: null,
  website: null,
  avatarUrl: null,
  bannerUrl: null,
  visibility: 'private',
  ProfileSection: [],
  ProfileLink: [],
  ProfileTheme: null,
  Presence: null,
  _count: {
    Follow_Follow_followeeIdToUser: 0,
    Follow_Follow_followerIdToUser: 0,
  },
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

function mockUsers(viewerId?: string) {
  mocks.user.findUnique.mockImplementation(async (query: { where: Record<string, string> }) => {
    if (query.where.username === 'owner') return profileUser;
    if (query.where.clerkId === 'clerk_owner') return { id: 'local_owner' };
    if (query.where.clerkId === 'clerk_viewer') return viewerId ? { id: viewerId } : null;
    return null;
  });
}

function profileRequest() {
  return new NextRequest('https://www.otaku-mori.com/api/v1/profile/owner');
}

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

  it('returns a schema-valid private profile to its authenticated owner', async () => {
    mocks.auth.mockResolvedValue({ userId: 'clerk_owner' });
    mockUsers();

    const response = await GET(profileRequest(), { params: { username: 'owner' } });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      ok: true,
      data: {
        id: 'local_owner',
        username: 'owner',
        display_name: 'Owner Name',
        visibility: 'private',
      },
    });
    expect(body.data).not.toHaveProperty('displayName');
  });

  it('denies an anonymous private-profile read without profile disclosure', async () => {
    mocks.auth.mockResolvedValue({ userId: null });
    mockUsers();

    const response = await GET(profileRequest(), { params: { username: 'owner' } });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({ ok: false, error: 'Profile is private' });
    expect(body).not.toHaveProperty('data');
  });

  it('denies a different signed-in user a private profile', async () => {
    mocks.auth.mockResolvedValue({ userId: 'clerk_viewer' });
    mockUsers('local_viewer');

    const response = await GET(profileRequest(), { params: { username: 'owner' } });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({ ok: false, error: 'Profile is private' });
    expect(mocks.block.findUnique).toHaveBeenCalledTimes(2);
  });

  it.each([
    ['profile owner blocks viewer', 'local_owner', 'local_viewer'],
    ['viewer blocks profile owner', 'local_viewer', 'local_owner'],
  ])('uses local User ids when %s', async (_label, blockerId, blockedId) => {
    mocks.auth.mockResolvedValue({ userId: 'clerk_viewer' });
    mockUsers('local_viewer');
    mocks.block.findUnique.mockImplementation(async (query) => {
      const ids = query.where.blockerId_blockedId;
      return ids.blockerId === blockerId && ids.blockedId === blockedId ? { id: 'block' } : null;
    });

    const response = await GET(profileRequest(), { params: { username: 'owner' } });
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ ok: false, error: 'User not found' });
    expect(JSON.stringify(mocks.block.findUnique.mock.calls)).not.toContain('clerk_viewer');
  });
});
