import 'server-only';

import { env } from '@/env';

export const FULFILLMENT_TEMPORARILY_DISABLED_CODE = 'FULFILLMENT_TEMPORARILY_DISABLED' as const;
export const FULFILLMENT_TEMPORARILY_DISABLED_MESSAGE =
  'Fulfillment submission is temporarily disabled pending operational verification.';

type FulfillmentAdmissionInputs = {
  releaseAuthorized: boolean;
  providerConfigured: boolean;
};

// This source-controlled authority must only change in an owner-approved release.
// Provider credentials alone can never authorize outbound order submission.
const FULFILLMENT_RELEASE_AUTHORIZED = false;

export function evaluateFulfillmentSubmissionAdmission(
  inputs: FulfillmentAdmissionInputs,
): boolean {
  return inputs.releaseAuthorized && inputs.providerConfigured;
}

export function getFulfillmentSubmissionPolicy() {
  return {
    enabled: evaluateFulfillmentSubmissionAdmission({
      releaseAuthorized: FULFILLMENT_RELEASE_AUTHORIZED,
      providerConfigured: Boolean(env.PRINTIFY_API_KEY && env.PRINTIFY_SHOP_ID),
    }),
    code: FULFILLMENT_TEMPORARILY_DISABLED_CODE,
    message: FULFILLMENT_TEMPORARILY_DISABLED_MESSAGE,
  } as const;
}
