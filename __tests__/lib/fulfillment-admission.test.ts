import { beforeEach, describe, expect, it, vi } from 'vitest';

const runtimeEnv = vi.hoisted(() => ({
  PRINTIFY_API_KEY: 'configured-test-key' as string | undefined,
  PRINTIFY_SHOP_ID: 'configured-shop' as string | undefined,
}));

vi.mock('@/env', () => ({ env: runtimeEnv }));

import {
  evaluateFulfillmentSubmissionAdmission,
  getFulfillmentSubmissionPolicy,
} from '@/lib/fulfillment/admission';

describe('fulfillment submission admission', () => {
  beforeEach(() => {
    runtimeEnv.PRINTIFY_API_KEY = 'configured-test-key';
    runtimeEnv.PRINTIFY_SHOP_ID = 'configured-shop';
  });

  it('defaults runtime submission to disabled even when provider credentials exist', () => {
    expect(getFulfillmentSubmissionPolicy()).toMatchObject({
      enabled: false,
      code: 'FULFILLMENT_TEMPORARILY_DISABLED',
    });
  });

  it('requires both source authorization and provider configuration', () => {
    expect(
      evaluateFulfillmentSubmissionAdmission({
        releaseAuthorized: true,
        providerConfigured: true,
      }),
    ).toBe(true);
    expect(
      evaluateFulfillmentSubmissionAdmission({
        releaseAuthorized: false,
        providerConfigured: true,
      }),
    ).toBe(false);
    expect(
      evaluateFulfillmentSubmissionAdmission({
        releaseAuthorized: true,
        providerConfigured: false,
      }),
    ).toBe(false);
  });
});
