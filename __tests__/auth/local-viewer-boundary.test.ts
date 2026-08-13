import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/app/lib/prisma';

vi.mock('server-only', () => ({}));

vi.mock('@/app/lib/prisma', () => ({
  prisma: {
    $transaction: vi.fn(),
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    userProfile: { upsert: vi.fn() },
    privacySettings: { upsert: vi.fn() },
    userSettings: { upsert: vi.fn() },
    cart: { upsert: vi.fn() },
    wallet: { upsert: vi.fn() },
  },
}));

const tx = {
  user: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  userProfile: { upsert: vi.fn() },
  privacySettings: { upsert: vi.fn() },
  userSettings: { upsert: vi.fn() },
  cart: { upsert: vi.fn() },
  wallet: { upsert: vi.fn() },
};

function clerkUser(overrides = {}) {
  return {
    id: 'clerk_user_123',
    username: 'Owner Name',
    firstName: 'Owner',
    lastName: 'Account',
    imageUrl: 'https://img.example.invalid/avatar.png',
    primaryEmailAddressId: 'email_1',
    emailAddresses: [{ id: 'email_1', emailAddress: 'owner@example.invalid' }],
    ...overrides,
  };
}

describe('local viewer identity boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => callback(tx));
    tx.user.findUnique.mockResolvedValue(null);
    tx.user.upsert.mockResolvedValue({
      id: 'local_user_123',
      clerkId: 'clerk_user_123',
      email: 'owner@example.invalid',
      username: 'Owner_Name',
      displayName: 'Owner Account',
      avatarUrl: 'https://img.example.invalid/avatar.png',
    });
    vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as any);
    vi.mocked(currentUser).mockResolvedValue(clerkUser() as any);
  });

  it('resolves existing local users by clerkId and keeps identifiers distinct', async () => {
    const { findLocalUserByClerkId } = await import('@/app/lib/auth/viewer');
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: 'local_user_123',
      clerkId: 'clerk_user_123',
      email: 'owner@example.invalid',
      username: 'traveler',
      displayName: null,
      avatarUrl: null,
    } as any);

    const viewer = await findLocalUserByClerkId('clerk_user_123');

    expect(viewer).toMatchObject({
      clerkUserId: 'clerk_user_123',
      localUserId: 'local_user_123',
    });
    expect(viewer?.clerkUserId).not.toBe(viewer?.localUserId);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { clerkId: 'clerk_user_123' },
      select: expect.objectContaining({ id: true, clerkId: true }),
    });
  });

  it('provisions missing users once through a clerkId-keyed upsert and default local records', async () => {
    const { requireLocalViewer } = await import('@/app/lib/auth/viewer');
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const viewer = await requireLocalViewer();

    expect(viewer.localUserId).toBe('local_user_123');
    expect(tx.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkId: 'clerk_user_123' },
        create: expect.objectContaining({ clerkId: 'clerk_user_123' }),
      }),
    );
    for (const model of ['userProfile', 'privacySettings', 'userSettings', 'cart', 'wallet'] as const) {
      expect(tx[model].upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'local_user_123' },
          create: expect.objectContaining({ userId: 'local_user_123' }),
        }),
      );
    }
  });

  it('handles email collisions without using shipping data or Clerk IDs as local IDs', async () => {
    const { ensureLocalUser } = await import('@/app/lib/auth/viewer');
    tx.user.findUnique.mockResolvedValue({ clerkId: 'different_clerk_user' });

    await ensureLocalUser(clerkUser() as any, prisma as any);

    expect(tx.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          clerkId: 'clerk_user_123',
          email: expect.stringMatching(/@users\.otaku-mori\.invalid$/),
        }),
      }),
    );
    expect(JSON.stringify(tx.user.upsert.mock.calls)).not.toContain('shipping');
  });

  it('keeps concurrent provisioning idempotent through database upsert semantics', async () => {
    const { ensureLocalUser } = await import('@/app/lib/auth/viewer');

    await Promise.all([
      ensureLocalUser(clerkUser() as any, prisma as any),
      ensureLocalUser(clerkUser() as any, prisma as any),
    ]);

    expect(tx.user.upsert).toHaveBeenCalledTimes(2);
    expect(tx.user.upsert.mock.calls.every((call) => call[0].where.clerkId === 'clerk_user_123')).toBe(true);
  });

  it('upserts Clerk webhook users by clerkId and creates local defaults', async () => {
    const { upsertLocalUserFromClerkWebhook } = await import('@/app/lib/auth/viewer');

    await upsertLocalUserFromClerkWebhook(
      {
        id: 'clerk_user_123',
        username: 'Owner',
        first_name: 'Owner',
        last_name: 'Account',
        image_url: null,
        primary_email_address_id: 'email_1',
        email_addresses: [{ id: 'email_1', email_address: 'owner@example.invalid' }],
      } as any,
      prisma as any,
    );

    expect(tx.user.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkId: 'clerk_user_123' },
        create: expect.objectContaining({ clerkId: 'clerk_user_123' }),
      }),
    );
    expect(tx.userProfile.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'local_user_123' } }),
    );
  });
});
