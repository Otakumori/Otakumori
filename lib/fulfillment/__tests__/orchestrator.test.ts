import { beforeEach, describe, expect, it, vi } from 'vitest';

const findUniqueMock = vi.fn();
const upsertAttemptMock = vi.fn();
const updateOrderMock = vi.fn();
const loadPrintifyOrderItemsMock = vi.fn();
const createPrintifyOrderMock = vi.fn();

vi.mock('@/env', () => ({
  env: {
    FULFILLMENT_PROVIDER: 'printify',
    FULFILLMENT_DRY_RUN: 'true',
    STRIPE_WEBHOOK_FULFILLMENT_DRY_RUN: undefined,
    PRINTIFY_API_KEY: 'present',
    PRINTIFY_SHOP_ID: 'present',
    PRINTIFY_API_URL: 'https://api.printify.test/v1',
  },
}));

vi.mock('@/lib/db', () => ({
  db: {
    fulfillmentAttempt: {
      findUnique: findUniqueMock,
      upsert: upsertAttemptMock,
    },
    order: {
      update: updateOrderMock,
    },
  },
}));

vi.mock('@/lib/fulfillment/printify', () => ({
  loadPrintifyOrderItems: loadPrintifyOrderItemsMock,
  createPrintifyOrder: createPrintifyOrderMock,
}));

vi.mock('@/app/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('fulfillment orchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findUniqueMock.mockResolvedValue(null);
    upsertAttemptMock.mockResolvedValue({});
    loadPrintifyOrderItemsMock.mockResolvedValue({
      lineItems: [{ product_id: 'product', variant_id: 1, quantity: 1 }],
      missingMappings: [],
    });
  });

  it('records dry-run attempts without calling the provider', async () => {
    const { dispatchFulfillment } = await import('../orchestrator');

    const result = await dispatchFulfillment('order_123', {
      source: 'stripe_webhook',
      sourceEventId: 'evt_123',
      sourceReference: 'cs_123',
    });

    expect(result).toMatchObject({
      status: 'dry_run',
      provider: 'printify',
      duplicate: false,
    });
    expect(createPrintifyOrderMock).not.toHaveBeenCalled();
    expect(upsertAttemptMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { idempotencyKey: 'order_123:printify:evt_123:cs_123' },
        create: expect.objectContaining({ status: 'dry_run' }),
      }),
    );
  });

  it('returns duplicate terminal attempts without provider calls', async () => {
    findUniqueMock.mockResolvedValue({
      status: 'succeeded',
      provider: 'printify',
      externalOrderId: 'pfy_123',
      errorCode: null,
    });
    const { dispatchFulfillment } = await import('../orchestrator');

    const result = await dispatchFulfillment('order_123', {
      source: 'stripe_webhook',
      sourceEventId: 'evt_123',
      sourceReference: 'cs_123',
    });

    expect(result).toMatchObject({
      status: 'succeeded',
      provider: 'printify',
      duplicate: true,
      externalOrderId: 'pfy_123',
    });
    expect(createPrintifyOrderMock).not.toHaveBeenCalled();
    expect(upsertAttemptMock).not.toHaveBeenCalled();
  });
});
