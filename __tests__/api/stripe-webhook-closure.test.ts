import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  runtimeEnv: {
    STRIPE_SECRET_KEY: 'stripe-test-key-fixture' as string | undefined,
    STRIPE_WEBHOOK_SECRET: 'stripe-webhook-secret-fixture' as string | undefined,
  },
  signature: 'test_signature' as string | null,
  stripeConstructor: vi.fn(),
  constructEvent: vi.fn(),
  event: null as any,
  retrieveSession: vi.fn(),
  eventCreate: vi.fn(),
  eventFind: vi.fn(),
  eventUpdate: vi.fn(),
  orderFind: vi.fn(),
  orderFindFirst: vi.fn(),
  orderUpdate: vi.fn(),
  createPrintifyOrder: vi.fn(),
  capturePaidOrderLedger: vi.fn(),
  reconcileRefundLedger: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: async () => {
    const result = new Headers();
    if (mocks.signature) result.set('stripe-signature', mocks.signature);
    return result;
  },
}));
vi.mock('@/env', () => ({
  env: mocks.runtimeEnv,
}));
vi.mock('@/app/lib/logger', () => ({ logger: { error: vi.fn() } }));
vi.mock('stripe', () => ({
  default: class StripeMock {
    constructor() {
      mocks.stripeConstructor();
    }
    webhooks = { constructEvent: mocks.constructEvent };
    checkout = { sessions: { retrieve: mocks.retrieveSession } };
  },
}));
vi.mock('@/lib/db', () => ({
  db: {
    webhookEvent: {
      create: mocks.eventCreate,
      findUnique: mocks.eventFind,
      update: mocks.eventUpdate,
    },
    order: {
      findUnique: mocks.orderFind,
      findFirst: mocks.orderFindFirst,
      update: mocks.orderUpdate,
    },
  },
}));
vi.mock('@/lib/fulfillment/printify', () => ({
  createPrintifyOrder: mocks.createPrintifyOrder,
}));
vi.mock('@/lib/finance/ledger', () => ({
  capturePaidOrderLedger: mocks.capturePaidOrderLedger,
  reconcileRefundLedger: mocks.reconcileRefundLedger,
}));

import { POST } from '@/app/api/webhooks/stripe/route';
import { POST as compatibilityPOST } from '@/app/api/stripe/webhook/route';

function request() {
  return new Request('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body: '{}',
  });
}

function checkoutEvent() {
  return {
    id: 'evt_checkout_1',
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_test_1' } },
  };
}

describe('Stripe webhook closure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.runtimeEnv.STRIPE_SECRET_KEY = 'stripe-test-key-fixture';
    mocks.runtimeEnv.STRIPE_WEBHOOK_SECRET = 'stripe-webhook-secret-fixture';
    mocks.signature = 'test_signature';
    mocks.event = checkoutEvent();
    mocks.constructEvent.mockImplementation(() => mocks.event);
    mocks.eventCreate.mockResolvedValue({});
    mocks.eventUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});
    mocks.createPrintifyOrder.mockResolvedValue({
      ok: true,
      printifyOrderId: 'printify_order_1',
    });
    mocks.capturePaidOrderLedger.mockResolvedValue({ rows: 3, cogsStatus: 'KNOWN' });
    mocks.reconcileRefundLedger.mockResolvedValue({});
    mocks.retrieveSession.mockResolvedValue({
      id: 'cs_test_1',
      payment_status: 'paid',
      client_reference_id: 'clerk_user_1',
      amount_total: 4200,
      amount_subtotal: 4000,
      currency: 'usd',
      total_details: { amount_tax: 0, amount_shipping: 500, amount_discount: 300 },
      payment_intent: { id: 'pi_1', latest_charge: { id: 'ch_1' } },
    });
    mocks.orderFind.mockResolvedValue({
      id: 'order_1',
      totalAmount: 4200,
      subtotalCents: 4000,
      currency: 'USD',
      taxAmount: 0,
      shippingAmount: 0,
      discountAmount: 300,
      paymentIntentId: null,
      chargeId: null,
      paidAt: null,
      User: { clerkId: 'clerk_user_1' },
    });
  });

  it('keeps the compatibility route bound to the canonical handler', () => {
    expect(compatibilityPOST).toBe(POST);
  });

  it('imports both routes without credentials or eager Stripe construction', async () => {
    vi.resetModules();
    mocks.runtimeEnv.STRIPE_SECRET_KEY = undefined;
    mocks.runtimeEnv.STRIPE_WEBHOOK_SECRET = undefined;

    const canonical = await import('@/app/api/webhooks/stripe/route');
    const compatibility = await import('@/app/api/stripe/webhook/route');

    expect(canonical.POST).toBeTypeOf('function');
    expect(compatibility.POST).toBe(canonical.POST);
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
  });

  it('returns retryable 503 without credentials or downstream side effects', async () => {
    mocks.runtimeEnv.STRIPE_SECRET_KEY = undefined;
    mocks.runtimeEnv.STRIPE_WEBHOOK_SECRET = undefined;

    const response = await POST(request());

    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual({
      ok: false,
      retry: true,
      error: 'Webhook processing is temporarily unavailable.',
    });
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
    expect(mocks.constructEvent).not.toHaveBeenCalled();
    expect(mocks.eventCreate).not.toHaveBeenCalled();
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
    expect(mocks.createPrintifyOrder).not.toHaveBeenCalled();
  });

  it('rejects a missing signature before constructing Stripe', async () => {
    mocks.signature = null;

    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Missing Stripe-Signature');
    expect(mocks.stripeConstructor).not.toHaveBeenCalled();
    expect(mocks.eventCreate).not.toHaveBeenCalled();
  });

  it('rejects an invalid signature without processing the event', async () => {
    mocks.constructEvent.mockImplementation(() => {
      throw new Error('invalid signature');
    });

    const response = await POST(request());

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Invalid signature');
    expect(mocks.stripeConstructor).toHaveBeenCalledTimes(1);
    expect(mocks.eventCreate).not.toHaveBeenCalled();
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
    expect(mocks.createPrintifyOrder).not.toHaveBeenCalled();
  });

  it('reconciles a paid pre-created order and invokes fulfillment once', async () => {
    const response = await POST(request());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.fulfillment).toBe('accepted');
    expect(mocks.orderUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order_1' },
        data: expect.objectContaining({
          status: 'pending_mapping',
          paymentIntentId: 'pi_1',
          chargeId: 'ch_1',
          shippingAmount: 500,
        }),
      }),
    );
    expect(mocks.createPrintifyOrder).toHaveBeenCalledTimes(1);
    expect(mocks.capturePaidOrderLedger).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order_1',
        stripeSessionId: 'cs_test_1',
        paymentIntentId: 'pi_1',
        chargeId: 'ch_1',
      }),
    );
  });

  it('does not replay a completed Stripe event', async () => {
    mocks.eventCreate.mockRejectedValue({ code: 'P2002' });
    mocks.eventFind.mockResolvedValue({
      updatedAt: new Date(),
      payload: { processingStatus: 'completed' },
    });

    const response = await POST(request());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.duplicate).toBe(true);
    expect(mocks.retrieveSession).not.toHaveBeenCalled();
    expect(mocks.createPrintifyOrder).not.toHaveBeenCalled();
  });

  it('keeps paid truth and exposes operator review when fulfillment fails', async () => {
    mocks.createPrintifyOrder.mockResolvedValue({ ok: false, error: 'provider rejected variant' });

    const response = await POST(request());
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.fulfillment).toBe('operator_review');
    expect(mocks.orderUpdate).toHaveBeenLastCalledWith({
      where: { id: 'order_1' },
      data: expect.objectContaining({
        status: 'pending_mapping',
        notes: expect.stringMatching(/operator review/i),
      }),
    });
  });

  it('reconciles cumulative refunds into the canonical finance ledger', async () => {
    mocks.event = {
      id: 'evt_refund_1',
      type: 'charge.refunded',
      created: 1_799_000_000,
      data: {
        object: {
          id: 'ch_1',
          payment_intent: 'pi_1',
          amount_refunded: 1200,
          currency: 'usd',
        },
      },
    };
    mocks.orderFindFirst.mockResolvedValue({
      id: 'order_1',
      status: 'in_production',
      totalAmount: 4200,
    });

    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(mocks.reconcileRefundLedger).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order_1',
        chargeId: 'ch_1',
        amountRefunded: 1200,
        currency: 'usd',
      }),
    );
  });
});
