import 'server-only';

import type Stripe from 'stripe';
import { getRuntimeEnvironment } from '@/env.mjs';

export const CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID = 'acct_1RwMJgHN4OLBC1u4' as const;
export const STRIPE_MERCHANT_CONFIGURATION_ERROR = 'STRIPE_MERCHANT_CONFIGURATION_INVALID';
export const STRIPE_MERCHANT_IDENTITY_ERROR = 'STRIPE_MERCHANT_IDENTITY_MISMATCH';

export type StripeCredentialMode = 'test' | 'live';
type MerchantEnvironment = Readonly<Record<string, string | undefined>>;

function credentialMode(secret: string): StripeCredentialMode | null {
  if (/^(sk|rk)_test_/.test(secret)) return 'test';
  if (/^(sk|rk)_live_/.test(secret)) return 'live';
  return null;
}

export function readStripeMerchantConfiguration(
  environment: MerchantEnvironment = getRuntimeEnvironment(),
) {
  const expectedAccountId = environment.STRIPE_EXPECTED_ACCOUNT_ID?.trim();
  const configuredMode = environment.STRIPE_MODE?.trim();
  const secret = environment.STRIPE_SECRET_KEY?.trim();

  if (
    expectedAccountId !== CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID ||
    (configuredMode !== 'test' && configuredMode !== 'live') ||
    !secret
  ) {
    throw new Error(STRIPE_MERCHANT_CONFIGURATION_ERROR);
  }

  const keyMode = credentialMode(secret);
  if (!keyMode || keyMode !== configuredMode) {
    throw new Error(STRIPE_MERCHANT_CONFIGURATION_ERROR);
  }

  return {
    accountId: CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID,
    mode: configuredMode,
  } as const;
}

export function isStripeMerchantConfigurationValid(
  environment: MerchantEnvironment = getRuntimeEnvironment(),
): boolean {
  try {
    readStripeMerchantConfiguration(environment);
    return true;
  } catch {
    return false;
  }
}

let attestation: Promise<{
  accountId: typeof CANONICAL_STRIPE_MERCHANT_ACCOUNT_ID;
  mode: StripeCredentialMode;
  country: 'US';
}> | null = null;

export async function attestStripeMerchantAccount(
  stripe: Pick<Stripe, 'accounts'>,
  environment: MerchantEnvironment = getRuntimeEnvironment(),
) {
  const configuration = readStripeMerchantConfiguration(environment);
  attestation ??= stripe.accounts.retrieveCurrent().then((account) => {
    if (account.id !== configuration.accountId || account.country !== 'US') {
      throw new Error(STRIPE_MERCHANT_IDENTITY_ERROR);
    }
    return {
      accountId: configuration.accountId,
      mode: configuration.mode,
      country: 'US' as const,
    };
  });

  try {
    return await attestation;
  } catch (error) {
    attestation = null;
    throw error;
  }
}

export function resetStripeMerchantAttestationForTests() {
  attestation = null;
}
