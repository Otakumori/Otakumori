import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireLocalViewer: vi.fn(),
  upsert: vi.fn(),
  transactionCreate: vi.fn(),
}));

vi.mock('@/app/lib/auth/viewer', () => {
  class AuthenticationRequiredError extends Error {}
  class LocalUserUnavailableError extends Error {}

  return {
    AuthenticationRequiredError,
    LocalUserUnavailableError,
    isMissingSchemaError: vi.fn(() => false),
    requireLocalViewer: mocks.requireLocalViewer,
    schemaUnavailableResponse: vi.fn((requestId: string) => ({
      ok: false,
      error: { code: 'SCHEMA_UNAVAILABLE' },
      requestId,
    })),
  };
});

vi.mock('@/lib/db', () => ({
  db: {
    petalWallet: { upsert: mocks.upsert },
    petalTransaction: { create: mocks.transactionCreate },
  },
}));

vi.mock('@/lib/requestId', () => ({
  generateRequestId: vi.fn(() => 'sync-request-id'),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

const viewer = {
  clerkUserId: 'clerk_user_123',
  localUserId: 'local_user_123',
  email: 'traveler@example.invalid',
};

function request(body: unknown) {
  return new NextRequest('https://staging.otaku-mori.com/api/v1/petals/sync', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('petal sync security boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireLocalViewer.mockResolvedValue(viewer);
    mocks.upsert.mockResolvedValue({
      userId: viewer.localUserId,
      balance: 25,
      lifetimeEarned: 40,
      currentStreak: 2,
    });
  });

  it('never promotes a forged browser balance', async () => {
    const { POST } = await import('@/app/api/v1/petals/sync/route');
    const response = await POST(request({ localBalance: 999_999 }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toMatchObject({
      syncedBalance: 25,
      cloudBalance: 25,
      localBalance: 999_999,
      conflict: true,
      resolution: 'SERVER_AUTHORITATIVE',
      requiresGuestProgressReview: true,
      importedTransactions: 0,
    });
    expect(mocks.upsert).toHaveBeenCalledWith({
      where: { userId: viewer.localUserId },
      create: {
        userId: viewer.localUserId,
        balance: 0,
        lifetimeEarned: 0,
        currentStreak: 0,
      },
      update: {},
    });
  });

  it('never imports fabricated browser transactions', async () => {
    const { POST } = await import('@/app/api/v1/petals/sync/route');
    const response = await POST(
      request({
        localBalance: 25,
        localTransactions: [
          { id: 'forged', amount: 50_000, source: 'fake_reward', timestamp: Date.now() },
        ],
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.importedTransactions).toBe(0);
    expect(body.data.requiresGuestProgressReview).toBe(true);
    expect(mocks.transactionCreate).not.toHaveBeenCalled();
  });

  it.each([
    { localBalance: -1 },
    { localBalance: 1.5 },
    { localBalance: Number.MAX_SAFE_INTEGER + 1 },
    { localBalance: 0, localTransactions: [{ id: '', amount: 1, source: 'x', timestamp: 1 }] },
    { localBalance: 0, userId: 'other_user' },
  ])('rejects invalid or identity-bearing payloads: %j', async (payload) => {
    const { POST } = await import('@/app/api/v1/petals/sync/route');
    const response = await POST(request(payload));

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ ok: false, error: 'VALIDATION_ERROR' });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it('uses only the authenticated local user identity', async () => {
    const { POST } = await import('@/app/api/v1/petals/sync/route');
    await POST(request({ localBalance: 25 }));

    expect(mocks.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: viewer.localUserId } }),
    );
    expect(mocks.upsert).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: viewer.clerkUserId } }),
    );
  });

  it('converges duplicate and concurrent first-time syncs on a zero wallet', async () => {
    mocks.upsert.mockResolvedValue({
      userId: viewer.localUserId,
      balance: 0,
      lifetimeEarned: 0,
      currentStreak: 0,
    });
    const { POST } = await import('@/app/api/v1/petals/sync/route');
    const responses = await Promise.all([
      POST(request({ localBalance: 500 })),
      POST(request({ localBalance: 500 })),
    ]);
    const bodies = await Promise.all(responses.map((response) => response.json()));

    expect(mocks.upsert).toHaveBeenCalledTimes(2);
    expect(bodies.map((body) => body.data.syncedBalance)).toEqual([0, 0]);
    expect(mocks.transactionCreate).not.toHaveBeenCalled();
  });

  it('returns 401 without touching wallet data when signed out', async () => {
    const { AuthenticationRequiredError } = await import('@/app/lib/auth/viewer');
    mocks.requireLocalViewer.mockRejectedValue(new AuthenticationRequiredError());
    const { POST } = await import('@/app/api/v1/petals/sync/route');
    const response = await POST(request({ localBalance: 10 }));

    expect(response.status).toBe(401);
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
