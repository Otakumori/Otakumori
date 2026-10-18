import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  findOrder: vi.fn(),
  retrieveSession: vi.fn(),
  createPrintifyOrder: vi.fn(),
}));

vi.mock('@/app/lib/auth/admin', () => ({ requireAdmin: mocks.requireAdmin }));
vi.mock('@/lib/db', () => ({ db: { order: { findUnique: mocks.findOrder } } }));
vi.mock('@/app/lib/stripe', () => ({
  stripe: { checkout: { sessions: { retrieve: mocks.retrieveSession } } },
}));
vi.mock('@/lib/fulfillment/printify', () => ({
  createPrintifyOrder: mocks.createPrintifyOrder,
}));

import { POST } from '@/app/api/admin/orders/[id]/fulfillment/route';

function request(body: unknown) {
  return new Request('http://localhost/api/admin/orders/order_1/fulfillment', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const context = { params: Promise.resolve({ id: 'order_1' }) };

describe('commerce fulfillment recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdmin.mockResolvedValue(undefined);
    mocks.retrieveSession.mockResolvedValue({ id: 'cs_test_1' });
    mocks.createPrintifyOrder.mockResolvedValue({ ok: true, printifyOrderId: 'po_1' });
  });

  it('fails closed for non-admin callers', async () => {
    mocks.requireAdmin.mockRejectedValue(new Error('Admin access required'));

    const response = await POST(request({}) as never, context);

    expect(response.status).toBe(403);
    expect(mocks.findOrder).not.toHaveBeenCalled();
  });

  it('requires an explicit operator confirmation', async () => {
    const response = await POST(request({ action: 'retry' }) as never, context);

    expect(response.status).toBe(400);
    expect(mocks.findOrder).not.toHaveBeenCalled();
  });

  it('blocks retry when the provider outcome is uncertain', async () => {
    mocks.findOrder.mockResolvedValue({
      id: 'order_1',
      stripeId: 'cs_test_1',
      paidAt: new Date(),
      PrintifyOrderSync: { status: 'submission_uncertain' },
    });

    const response = await POST(
      request({ action: 'retry', confirmation: 'RETRY PRINTIFY FULFILLMENT' }) as never,
      context,
    );

    expect(response.status).toBe(409);
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.createPrintifyOrder).not.toHaveBeenCalled();
  });

  it('retrieves authoritative Stripe shipping facts for a confirmed safe retry', async () => {
    const order = {
      id: 'order_1',
      stripeId: 'cs_test_1',
      paidAt: new Date(),
      PrintifyOrderSync: { status: 'failed' },
    };
    mocks.findOrder.mockResolvedValue(order);
    const session = { id: 'cs_test_1', shipping_details: { name: 'Test Customer' } };
    mocks.retrieveSession.mockResolvedValue(session);

    const response = await POST(
      request({ action: 'retry', confirmation: 'RETRY PRINTIFY FULFILLMENT' }) as never,
      context,
    );

    expect(response.status).toBe(200);
    expect(mocks.createPrintifyOrder).toHaveBeenCalledWith('order_1', session, {
      allowRetry: true,
    });
  });
});
