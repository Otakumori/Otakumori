import { beforeEach, describe, expect, it, vi } from 'vitest';

const constructEventMock = vi.fn();
const retrieveSessionMock = vi.fn();
const createPrintifyOrderMock = vi.fn();
const guardStripeRuntimeUsageMock = vi.fn(() => ({ ok: true, mode: 'test', target: 'preview' }));

const dbMock = {
  webhookEvent: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  stripeCustomer: {
    findUnique: vi.fn(),
  },
  user: {
    findFirst: vi.fn(),
  },
  order: {
    update: vi.fn(),
    upsert: vi.fn(),
  },
};

vi.mock('next/headers', () => ({
  headers: vi.fn(async () => new Headers({ 'stripe-signature': 'signed-test-event' })),
}));

vi.mock('@/env', () => ({
  env: {
    STRIPE_SECRET_KEY: 'sk_test_mock',
    STRIPE_WEBHOOK_SECRET: 'whsec_mock',
    STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN: 'true',
    VERCEL_ENV: 'preview',
    NODE_ENV: 'test',
    ALLOW_LIVE_KEYS_IN_NON_PROD: undefined,
    ALLOW_TEST_KEYS_IN_PRODUCTION: undefined,
  },
}));

vi.mock('@/lib/db', () => ({
  db: dbMock,
}));

vi.mock('@/lib/fulfillment/printify', () => ({
  createPrintifyOrder: createPrintifyOrderMock,
}));

vi.mock('@/lib/security/stripe-runtime-guard', () => ({
  guardStripeRuntimeUsage: guardStripeRuntimeUsageMock,
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: constructEventMock,
    },
    checkout: {
      sessions: {
        retrieve: retrieveSessionMock,
      },
    },
  })),
}));

describe('Stripe webhook fulfillment dry-run', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    constructEventMock.mockReturnValue({
      id: 'evt_test_dry_run',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_dry_run',
        },
      },
    });

    retrieveSessionMock.mockResolvedValue({
      id: 'cs_test_dry_run',
      amount_total: 4200,
      currency: 'usd',
      payment_intent: 'pi_test_dry_run',
      metadata: {
        local_order_id: 'order_test_dry_run',
      },
    });

    dbMock.webhookEvent.findUnique.mockResolvedValue(null);
    dbMock.webhookEvent.create.mockResolvedValue({ id: 'webhook_event_test' });
    dbMock.webhookEvent.update.mockResolvedValue({ id: 'webhook_event_test' });
    dbMock.order.update.mockResolvedValue({ id: 'order_test_dry_run' });
  });

  it('verifies a signed checkout.session.completed event and skips Printify in dry-run mode', async () => {
    const { POST } = await import('../route');

    const response = await POST(new Request('https://preview.test/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ id: 'evt_test_dry_run' }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, fulfillment: 'dry_run_skipped' });
    expect(constructEventMock).toHaveBeenCalledWith(
      JSON.stringify({ id: 'evt_test_dry_run' }),
      'signed-test-event',
      'whsec_mock',
    );
    expect(retrieveSessionMock).toHaveBeenCalledWith('cs_test_dry_run', {
      expand: ['line_items.data.price.product'],
    });
    expect(dbMock.order.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'order_test_dry_run' },
      }),
    );
    expect(createPrintifyOrderMock).not.toHaveBeenCalled();
  });

  it('returns the duplicate response without retrieving the session or calling Printify', async () => {
    dbMock.webhookEvent.findUnique.mockResolvedValue({
      id: 'webhook_event_test',
      processingStatus: 'processed',
    });

    const { POST } = await import('../route');

    const response = await POST(new Request('https://preview.test/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify({ id: 'evt_test_dry_run' }),
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, duplicate: true, reason: 'already_processed' });
    expect(constructEventMock).toHaveBeenCalled();
    expect(retrieveSessionMock).not.toHaveBeenCalled();
    expect(createPrintifyOrderMock).not.toHaveBeenCalled();
  });
});
