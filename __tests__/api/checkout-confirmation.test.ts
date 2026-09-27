import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { requireLocalViewer } from '@/app/lib/auth/viewer';
import { prisma } from '@/app/lib/prisma';

const retrieveSession = vi.hoisted(() => vi.fn());

vi.mock('@/env', () => ({ env: { STRIPE_SECRET_KEY: 'sk_test_mock' } }));
vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    checkout: { sessions: { retrieve: retrieveSession } },
  })),
}));
vi.mock('@/app/lib/auth/viewer', () => ({
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  LocalUserUnavailableError: class LocalUserUnavailableError extends Error {},
  requireLocalViewer: vi.fn(),
}));
vi.mock('@/app/lib/prisma', () => ({
  prisma: { order: { findUnique: vi.fn() } },
}));
vi.mock('@/app/lib/logger', () => ({ logger: { error: vi.fn() } }));

describe('checkout success confirmation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireLocalViewer).mockResolvedValue({
      localUserId: 'local_user_1',
      clerkUserId: 'clerk_user_1',
      email: 'traveler@example.invalid',
      username: 'traveler',
      displayName: null,
      avatarUrl: null,
    });
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 'order_1',
      userId: 'local_user_1',
      displayNumber: 42,
      status: 'pending',
    } as never);
    retrieveSession.mockResolvedValue({
      id: 'cs_test_confirmed',
      client_reference_id: 'clerk_user_1',
      status: 'complete',
      payment_status: 'paid',
    });
  });

  it('confirms only a paid Stripe session owned by the local user', async () => {
    const { GET } = await import('@/app/api/v1/checkout/confirmation/route');
    const response = await GET(new NextRequest('http://localhost/api/v1/checkout/confirmation?session_id=cs_test_confirmed'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      data: { orderId: 'order_1', orderNumber: 42 },
    });
  });

  it('does not confirm or clear context for an unfinished payment', async () => {
    retrieveSession.mockResolvedValue({
      id: 'cs_test_confirmed',
      client_reference_id: 'clerk_user_1',
      status: 'open',
      payment_status: 'unpaid',
    });
    const { GET } = await import('@/app/api/v1/checkout/confirmation/route');
    const response = await GET(new NextRequest('http://localhost/api/v1/checkout/confirmation?session_id=cs_test_confirmed'));

    expect(response.status).toBe(409);
  });

  it('does not disclose another user\'s session', async () => {
    vi.mocked(prisma.order.findUnique).mockResolvedValue({
      id: 'order_1',
      userId: 'another_user',
      displayNumber: 42,
      status: 'pending',
    } as never);
    const { GET } = await import('@/app/api/v1/checkout/confirmation/route');
    const response = await GET(new NextRequest('http://localhost/api/v1/checkout/confirmation?session_id=cs_test_confirmed'));

    expect(response.status).toBe(404);
    expect(retrieveSession).not.toHaveBeenCalled();
  });
});
