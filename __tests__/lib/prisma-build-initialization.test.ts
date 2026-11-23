import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  constructor: vi.fn(),
  databaseUrl: undefined as string | undefined,
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: class PrismaClientMock {
    constructor(options: unknown) {
      mocks.constructor(options);
    }
  },
}));

vi.mock('@clerk/nextjs/server', () => ({ auth: vi.fn() }));
vi.mock('@/env.mjs', () => ({
  env: {
    get DATABASE_URL() {
      return mocks.databaseUrl;
    },
  },
}));

describe('database client build-time initialization', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.databaseUrl = undefined;
    delete (globalThis as { prisma?: unknown }).prisma;
  });

  it('omits the datasource override when no runtime database URL is available', async () => {
    await import('@/app/lib/db');

    expect(mocks.constructor).toHaveBeenCalledWith(
      expect.not.objectContaining({ datasources: expect.anything() }),
    );
  });

  it('uses the verified runtime URL when one is configured', async () => {
    mocks.databaseUrl = 'postgresql://local-fixture.invalid/neondb';

    await import('@/app/lib/db');

    expect(mocks.constructor).toHaveBeenCalledWith(
      expect.objectContaining({
        datasources: { db: { url: 'postgresql://local-fixture.invalid/neondb' } },
      }),
    );
  });
});
