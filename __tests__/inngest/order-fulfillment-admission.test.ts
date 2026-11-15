import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createFunction: vi.fn((_options, _trigger, handler) => handler),
  send: vi.fn(),
  admission: vi.fn(() => ({
    enabled: false,
    code: 'FULFILLMENT_TEMPORARILY_DISABLED',
    message: 'Fulfillment submission is temporarily disabled pending operational verification.',
  })),
  findOrder: vi.fn(),
  getPrintifyService: vi.fn(),
}));

vi.mock('@/inngest/client', () => ({
  inngest: {
    createFunction: mocks.createFunction,
    send: mocks.send,
  },
}));
vi.mock('@/lib/fulfillment/admission', () => ({
  getFulfillmentSubmissionPolicy: mocks.admission,
}));
vi.mock('@/lib/db', () => ({
  db: {
    order: { findUnique: mocks.findOrder, update: vi.fn() },
    printifyOrderSync: { upsert: vi.fn() },
    cartItem: { deleteMany: vi.fn() },
  },
}));
vi.mock('@/app/lib/printify/service', () => ({
  getPrintifyService: mocks.getPrintifyService,
}));
vi.mock('@/app/lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn() },
}));

import { fulfillOrder } from '@/inngest/order-fulfillment';

describe('Inngest fulfillment admission', () => {
  it('fails before database steps or provider initialization while submission is disabled', async () => {
    const step = { run: vi.fn() };

    await expect(
      (fulfillOrder as unknown as (input: unknown) => Promise<unknown>)({
        event: { data: { orderId: 'order_test' } },
        step,
      }),
    ).rejects.toThrow(/FULFILLMENT_TEMPORARILY_DISABLED/);

    expect(step.run).not.toHaveBeenCalled();
    expect(mocks.findOrder).not.toHaveBeenCalled();
    expect(mocks.getPrintifyService).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });
});
