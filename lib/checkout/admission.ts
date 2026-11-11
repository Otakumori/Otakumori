import 'server-only';

import {
  CHECKOUT_TEMPORARILY_DISABLED_CODE,
  CHECKOUT_TEMPORARILY_DISABLED_MESSAGE,
} from '@/lib/checkout/contract';
import { env } from '@/env';

type CheckoutAdmissionInputs = {
  releaseAuthorized: boolean;
  checkoutConfigured: boolean;
  fulfillmentVerified: boolean;
};

// This source-controlled authority must only change in an owner-approved release.
// Runtime configuration cannot independently activate live checkout.
const RELEASE_AUTHORIZED = false;
const FULFILLMENT_VERIFIED = false;

export function evaluateCheckoutAdmission(inputs: CheckoutAdmissionInputs): boolean {
  return inputs.releaseAuthorized && inputs.checkoutConfigured && inputs.fulfillmentVerified;
}
export function getCheckoutAdmissionPolicy() {
  const enabled = evaluateCheckoutAdmission({
    releaseAuthorized: RELEASE_AUTHORIZED,
    checkoutConfigured: Boolean(env.STRIPE_SECRET_KEY),
    fulfillmentVerified:
      FULFILLMENT_VERIFIED && Boolean(env.PRINTIFY_API_KEY && env.PRINTIFY_SHOP_ID),
  });

  return {
    enabled,
    code: CHECKOUT_TEMPORARILY_DISABLED_CODE,
    message: CHECKOUT_TEMPORARILY_DISABLED_MESSAGE,
  } as const;
}
