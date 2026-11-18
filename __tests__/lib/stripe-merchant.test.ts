import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

import {
  CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID,
  STRIPE_MERCHANT_CONFIGURATION_ERROR,
  STRIPE_MERCHANT_IDENTITY_ERROR,
  attestStripeMerchantAccount,
  isStripeMerchantConfigurationValid,
  readStripeMerchantConfiguration,
  resetStripeMerchantAttestationForTests,
} from '@/lib/stripe/merchant';

const testEnvironment = {
  STRIPE_EXPECTED_ACCOUNT_ID: CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID,
  STRIPE_MODE: 'test',
  STRIPE_SECRET_KEY: 'sk_test_fixture',
};

describe('Stripe merchant authority', () => {
  beforeEach(() => resetStripeMerchantAttestationForTests());

  it('requires the canonical account, explicit mode, and matching key mode', () => {
    expect(readStripeMerchantConfiguration(testEnvironment)).toEqual({
      accountId: CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID,
      mode: 'test',
    });
    expect(() =>
      readStripeMerchantConfiguration({
        ...testEnvironment,
        STRIPE_EXPECTED_ACCOUNT_ID: 'acct_wrong',
      }),
    ).toThrow(STRIPE_MERCHANT_CONFIGURATION_ERROR);
    expect(isStripeMerchantConfigurationValid(testEnvironment)).toBe(true);
    expect(isStripeMerchantConfigurationValid({ ...testEnvironment, STRIPE_MODE: undefined })).toBe(
      false,
    );
    expect(() =>
      readStripeMerchantConfiguration({
        ...testEnvironment,
        STRIPE_MODE: 'live',
      }),
    ).toThrow(STRIPE_MERCHANT_CONFIGURATION_ERROR);
  });

  it('attests the credential against the selected US merchant account', async () => {
    const retrieveCurrent = vi.fn().mockResolvedValue({
      id: CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID,
      country: 'US',
    });
    await expect(
      attestStripeMerchantAccount({ accounts: { retrieveCurrent } } as never, testEnvironment),
    ).resolves.toMatchObject({
      accountId: CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID,
      mode: 'test',
      country: 'US',
    });
    expect(retrieveCurrent).toHaveBeenCalledTimes(1);
  });

  it('fails closed for a cross-account credential and does not cache the failure', async () => {
    const retrieveCurrent = vi
      .fn()
      .mockResolvedValueOnce({ id: 'acct_wrong', country: 'US' })
      .mockResolvedValueOnce({ id: CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID, country: 'US' });
    const stripe = { accounts: { retrieveCurrent } } as never;

    await expect(attestStripeMerchantAccount(stripe, testEnvironment)).rejects.toThrow(
      STRIPE_MERCHANT_IDENTITY_ERROR,
    );
    await expect(attestStripeMerchantAccount(stripe, testEnvironment)).resolves.toMatchObject({
      accountId: CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID,
    });
  });
});
