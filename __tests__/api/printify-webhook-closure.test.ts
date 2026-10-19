import { createHmac } from 'node:crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  eventCreate: vi.fn(),
  eventFind: vi.fn(),
  eventUpdate: vi.fn(),
  syncFind: vi.fn(),
  syncUpdate: vi.fn(),
  orderUpdate: vi.fn(),
  transaction: vi.fn(async (operations: Promise<unknown>[]) => Promise.all(operations)),
  handleWebhookEvent: vi.fn(),
}));

vi.mock('@/env.mjs', () => ({ env: { PRINTIFY_WEBHOOK_SECRET: 'printify_test_secret' } }));
vi.mock('@/app/lib/logger', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));
vi.mock('@/app/lib/requestId', () => ({ newRequestId: () => 'request_1' }));
vi.mock('@/lib/db', () => ({
  db: {
    webhookEvent: {
      create: mocks.eventCreate,
      findUnique: mocks.eventFind,
      update: mocks.eventUpdate,
    },
    printifyOrderSync: {
      findFirst: mocks.syncFind,
      update: mocks.syncUpdate,
    },
    order: { update: mocks.orderUpdate },
    $transaction: mocks.transaction,
  },
}));
vi.mock('@/app/lib/printify/advanced-service', () => ({
  getAdvancedPrintifyService: () => ({ handleWebhookEvent: mocks.handleWebhookEvent }),
}));

import { POST } from '@/app/api/webhooks/printify/route';

function webhookRequest(payload: unknown, validSignature = true) {
  const raw = JSON.stringify(payload);
  const digest = createHmac('sha256', 'printify_test_secret').update(raw).digest('hex');
  return new Request('http://localhost/api/webhooks/printify', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-pfy-signature': validSignature ? `sha256=${digest}` : 'sha256=invalid',
    },
    body: raw,
  });
}

const shipment = {
  id: 'event_1',
  type: 'order:shipment:created',
  resource: {
    id: 'printify_order_1',
    data: {
      shipped_at: '2026-10-18T12:00:00.000Z',
      carrier: {
        code: 'USPS',
        tracking_number: 'TRACK123',
        tracking_url: 'https://tracking.example/TRACK123',
      },
    },
  },
};

describe('Printify webhook closure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.eventCreate.mockResolvedValue({});
    mocks.eventUpdate.mockResolvedValue({});
    mocks.syncFind.mockResolvedValue({ localOrderId: 'order_1' });
    mocks.syncUpdate.mockResolvedValue({});
    mocks.orderUpdate.mockResolvedValue({});
    mocks.handleWebhookEvent.mockResolvedValue(undefined);
  });

  it('rejects a payload without the official signature contract', async () => {
    const response = await POST(webhookRequest(shipment, false) as never);

    expect(response.status).toBe(401);
    expect(mocks.eventCreate).not.toHaveBeenCalled();
  });

  it('records tracking through the mapped local order exactly once', async () => {
    const response = await POST(webhookRequest(shipment) as never);

    expect(response.status).toBe(200);
    expect(mocks.syncFind).toHaveBeenCalledWith({
      where: { printifyOrderId: 'printify_order_1' },
    });
    expect(mocks.orderUpdate).toHaveBeenCalledWith({
      where: { id: 'order_1' },
      data: expect.objectContaining({
        status: 'shipped',
        carrier: 'USPS',
        trackingNumber: 'TRACK123',
        trackingUrl: 'https://tracking.example/TRACK123',
      }),
    });
    expect(mocks.eventUpdate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: { payload: expect.objectContaining({ processingStatus: 'completed' }) },
      }),
    );
  });

  it('acknowledges an already-completed provider event without replaying state', async () => {
    mocks.eventCreate.mockRejectedValue({ code: 'P2002' });
    mocks.eventFind.mockResolvedValue({
      updatedAt: new Date(),
      payload: { processingStatus: 'completed' },
    });

    const response = await POST(webhookRequest(shipment) as never);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.duplicate).toBe(true);
    expect(mocks.syncFind).not.toHaveBeenCalled();
    expect(mocks.orderUpdate).not.toHaveBeenCalled();
  });
});
