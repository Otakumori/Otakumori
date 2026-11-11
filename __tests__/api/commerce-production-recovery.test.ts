import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authorize: vi.fn(),
  providerModuleLoads: vi.fn(),
  findOrder: vi.fn(),
  retrieveSession: vi.fn(),
  createPrintifyOrder: vi.fn(),
}));

vi.mock('@/app/lib/auth/admin', () => ({
  withAdminAuth:
    (handler: (request: Request, context: unknown) => Promise<Response>) =>
    async (request: Request, context: unknown) => {
      const failure = await mocks.authorize();
      return failure ?? handler(request, context);
    },
}));
vi.mock('@/lib/db', () => ({ db: { order: { findUnique: mocks.findOrder } } }));
vi.mock('@/app/lib/stripe', () => {
  mocks.providerModuleLoads('stripe');
  return { stripe: { checkout: { sessions: { retrieve: mocks.retrieveSession } } } };
});
vi.mock('@/lib/fulfillment/printify', () => {
  mocks.providerModuleLoads('printify');
  return { createPrintifyOrder: mocks.createPrintifyOrder };
});

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
    mocks.authorize.mockResolvedValue(null);
    mocks.retrieveSession.mockResolvedValue({ id: 'cs_test_1' });
    mocks.createPrintifyOrder.mockResolvedValue({ ok: true, printifyOrderId: 'po_1' });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads without provider initialization or network access', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    expect(POST).toBeTypeOf('function');
    expect(mocks.providerModuleLoads).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    [401, 'AUTH_REQUIRED'],
    [403, 'FORBIDDEN'],
  ])('fails closed with %i before loading providers', async (status, code) => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    mocks.authorize.mockResolvedValue(
      Response.json({ ok: false, error: code }, { status }),
    );

    const response = await POST(request({}) as never, context);

    expect(response.status).toBe(status);
    expect(mocks.findOrder).not.toHaveBeenCalled();
    expect(mocks.providerModuleLoads).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('requires an explicit operator confirmation', async () => {
    const response = await POST(request({ action: 'retry' }) as never, context);

    expect(response.status).toBe(400);
    expect(mocks.findOrder).not.toHaveBeenCalled();
    expect(mocks.providerModuleLoads).not.toHaveBeenCalled();
  });

  it('does not load providers for a missing or unpaid order', async () => {
    mocks.findOrder.mockResolvedValueOnce(null).mockResolvedValueOnce({
      id: 'order_1',
      stripeId: 'cs_test_1',
      paidAt: null,
      PrintifyOrderSync: { status: 'failed' },
    });

    const missingResponse = await POST(
      request({ action: 'retry', confirmation: 'RETRY PRINTIFY FULFILLMENT' }) as never,
      context,
    );
    const unpaidResponse = await POST(
      request({ action: 'retry', confirmation: 'RETRY PRINTIFY FULFILLMENT' }) as never,
      context,
    );

    expect(missingResponse.status).toBe(404);
    expect(unpaidResponse.status).toBe(409);
    expect(mocks.providerModuleLoads).not.toHaveBeenCalled();
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.createPrintifyOrder).not.toHaveBeenCalled();
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
    expect(mocks.providerModuleLoads).not.toHaveBeenCalled();
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
    expect(mocks.providerModuleLoads).toHaveBeenCalledWith('stripe');
    expect(mocks.providerModuleLoads).toHaveBeenCalledWith('printify');
    expect(mocks.createPrintifyOrder).toHaveBeenCalledWith('order_1', session, {
      allowRetry: true,
    });
  });
});
