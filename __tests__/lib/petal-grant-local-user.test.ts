import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  checkRateLimit: vi.fn(),
  getClientIdentifier: vi.fn(),
  isMissingSchemaError: vi.fn((error: any) => error?.code === 'P2021' || error?.code === 'P2022'),
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
  tx: {
    petalLedger: { create: vi.fn() },
    petalTransaction: { create: vi.fn() },
    petalWallet: { upsert: vi.fn() },
    user: { updateMany: vi.fn() },
  },
  db: {
    $transaction: vi.fn(),
    petalTransaction: { aggregate: vi.fn() },
    petalWallet: { findUnique: vi.fn() },
  },
}));

vi.mock('@/app/lib/auth/viewer', () => ({
  isMissingSchemaError: mocks.isMissingSchemaError,
}));

vi.mock('@/app/lib/logger', () => ({
  logger: mocks.logger,
}));

vi.mock('@/app/lib/rate-limiting', () => ({
  checkRateLimit: mocks.checkRateLimit,
  getClientIdentifier: mocks.getClientIdentifier,
}));

vi.mock('@/lib/db', () => ({
  db: mocks.db,
}));

describe('grantPetals local user persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mocks.checkRateLimit.mockResolvedValue({ success: true });
    mocks.getClientIdentifier.mockReturnValue('client-id');
    mocks.db.petalTransaction.aggregate.mockResolvedValue({ _sum: { amount: 0 } });
    mocks.db.$transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => Promise<unknown>) =>
      callback(mocks.tx),
    );
    mocks.tx.petalWallet.upsert.mockResolvedValue({ balance: 7, lifetimeEarned: 7 });
  });

  it('writes petal records and balance sync using the local User.id', async () => {
    const { grantPetals } = await import('@/app/lib/petals/grant');
    const result = await grantPetals({
      userId: 'local_user_123',
      amount: 7,
      source: 'mini_game',
      description: 'Game reward: mori_runner',
      requestId: 'route-request-id',
      req: new NextRequest('https://www.otaku-mori.com/api/v1/petals/earn'),
    });

    expect(result).toMatchObject({ success: true, granted: 7, newBalance: 7, lifetimeEarned: 7 });
    expect(mocks.tx.petalWallet.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'local_user_123' },
        create: expect.objectContaining({ userId: 'local_user_123' }),
      }),
    );
    expect(mocks.tx.petalTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'local_user_123', amount: 7, source: 'mini_game' }),
      }),
    );
    expect(mocks.tx.petalLedger.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'local_user_123', type: 'earn', amount: 7 }),
      }),
    );
    expect(mocks.tx.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'local_user_123' },
      data: { petalBalance: 7 },
    });
    expect(mocks.tx.user.updateMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { clerkId: 'local_user_123' } }),
    );
  });

  it('classifies missing petal schema without returning raw Prisma details', async () => {
    mocks.db.petalTransaction.aggregate.mockRejectedValue({
      code: 'P2021',
      message: 'The table public.PetalWallet does not exist',
    });

    const { grantPetals } = await import('@/app/lib/petals/grant');
    const result = await grantPetals({
      userId: 'local_user_123',
      amount: 7,
      source: 'mini_game',
      requestId: 'route-request-id',
      req: new NextRequest('https://www.otaku-mori.com/api/v1/petals/earn'),
    });

    expect(result).toMatchObject({
      success: false,
      granted: 0,
      errorCode: 'SCHEMA_UNAVAILABLE',
      error: 'Petal grants are temporarily unavailable.',
    });
    expect(JSON.stringify(result)).not.toMatch(/Prisma|PetalWallet|does not exist/i);
  });
});
