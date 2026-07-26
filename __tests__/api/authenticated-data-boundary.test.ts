import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { db } from '@/lib/db';
import { requireLocalViewer } from '@/app/lib/auth/viewer';

vi.mock('server-only', () => ({}));

vi.mock('@/app/lib/auth/viewer', () => ({
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  LocalUserUnavailableError: class LocalUserUnavailableError extends Error {},
  isMissingSchemaError: vi.fn((error: any) => error?.code === 'P2021' || error?.code === 'P2022'),
  requireLocalViewer: vi.fn(),
  schemaUnavailableResponse: vi.fn((requestId: string) => ({
    ok: false,
    error: {
      code: 'SCHEMA_UNAVAILABLE',
      message: 'This account feature is temporarily unavailable while account data is prepared.',
    },
    requestId,
  })),
}));

vi.mock('@/lib/db', () => ({
  db: {
    product: { findUnique: vi.fn() },
    wishlist: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
    petalWallet: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    petalTransaction: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/app/lib/db', () => ({
  db: {
    petalWallet: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
    },
    petalTransaction: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/app/lib/idempotency', () => ({
  checkIdempotency: vi.fn().mockResolvedValue({}),
  storeIdempotencyResponse: vi.fn(),
}));

vi.mock('@/app/lib/rate-limiting', () => ({
  withRateLimit: vi.fn((_key: string, handler: (request: NextRequest) => Promise<Response>) => handler),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

const viewer = {
  clerkUserId: 'clerk_user_123',
  localUserId: 'local_user_123',
  email: 'owner@example.invalid',
  username: 'traveler',
  displayName: null,
  avatarUrl: null,
};

describe('authenticated data API boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireLocalViewer).mockResolvedValue(viewer);
  });

  it('uses local User.id for wishlist reads', async () => {
    vi.mocked(db.wishlist.findMany).mockResolvedValue([]);
    const { GET } = await import('@/app/api/v1/wishlist/route');

    const response = await GET(new NextRequest('http://localhost/api/v1/wishlist'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(db.wishlist.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'local_user_123' } }),
    );
    expect(db.wishlist.findMany).not.toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'clerk_user_123' } }),
    );
  });

  it('uses local User.id for wishlist writes', async () => {
    vi.mocked(db.product.findUnique).mockResolvedValue({
      id: 'product_1',
      name: 'Product',
      primaryImageUrl: null,
    } as any);
    vi.mocked(db.wishlist.findUnique).mockResolvedValue(null);
    vi.mocked(db.wishlist.create).mockResolvedValue({ id: 'wish_1', productId: 'product_1' } as any);
    const { POST } = await import('@/app/api/v1/wishlist/route');

    const response = await POST(
      new NextRequest('http://localhost/api/v1/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId: 'product_1' }),
      }),
    );

    expect(response.status).toBe(200);
    expect(db.wishlist.create).toHaveBeenCalledWith({
      data: { userId: 'local_user_123', productId: 'product_1' },
    });
  });

  it('returns a bounded unavailable response for missing wishlist schema', async () => {
    vi.mocked(db.wishlist.findMany).mockRejectedValue({ code: 'P2021' });
    const { GET } = await import('@/app/api/v1/wishlist/route');

    const response = await GET(new NextRequest('http://localhost/api/v1/wishlist'));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toMatchObject({ code: 'SCHEMA_UNAVAILABLE' });
    expect(JSON.stringify(body)).not.toContain('PrismaClientKnownRequestError');
  });
});
