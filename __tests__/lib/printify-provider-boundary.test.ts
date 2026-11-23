import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  admission: vi.fn(),
}));

vi.mock('@/env.mjs', () => ({
  env: {
    PRINTIFY_API_KEY: 'configured-test-key',
    PRINTIFY_SHOP_ID: 'configured-shop',
  },
}));
vi.mock('@/lib/fulfillment/admission', () => ({
  getFulfillmentSubmissionPolicy: mocks.admission,
}));

import { PrintifyService } from '@/app/lib/printify/service';

describe('Printify provider order boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.admission.mockReturnValue({
      enabled: false,
      code: 'FULFILLMENT_TEMPORARILY_DISABLED',
      message: 'Fulfillment submission is temporarily disabled pending operational verification.',
    });
    vi.stubGlobal('fetch', vi.fn());
  });

  it('refuses an order before network access when fulfillment is disabled', async () => {
    const service = new PrintifyService();

    await expect(
      service.createOrder({
        external_id: 'test-order',
        label: 'Test order',
        line_items: [],
        shipping_method: 1,
        send_shipping_notification: false,
        address_to: {
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.invalid',
          country: 'US',
          region: 'CA',
          city: 'Test',
          zip: '00000',
          address1: 'Test',
        },
      }),
    ).rejects.toThrow(/FULFILLMENT_TEMPORARILY_DISABLED/);
    expect(fetch).not.toHaveBeenCalled();
  });
});
