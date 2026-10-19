export type FilingFrequency = 'monthly' | 'quarterly' | 'annual';

export type TaxRegistration = {
  jurisdiction: string;
  registered: boolean;
  effectiveDate: string | null;
  registrationId: string | null;
  filingFrequency: FilingFrequency | null;
  taxProvider: 'stripe';
  status: 'not_registered' | 'configured' | 'paused';
  notes: string;
};

/**
 * Factual operational registry only. An empty registry makes no nexus claim.
 * Registration identifiers must be added only after owner/legal confirmation.
 */
export const TAX_REGISTRATIONS: readonly TaxRegistration[] = [];

export const STRIPE_TAX_READINESS = {
  status: 'BLOCKED' as const,
  automaticTaxEnabled: false,
  manualTaxEnabled: false,
  registrationsConfigured: TAX_REGISTRATIONS.some(
    (registration) => registration.registered && registration.status === 'configured',
  ),
  productTaxCodePolicyConfigured: false,
  shippingTaxTreatmentConfigured: false,
  checkoutIntegrationPoint: 'app/api/v1/checkout/session/route.ts',
  blockers: [
    'No confirmed tax registrations are recorded.',
    'Product tax-code policy is not configured.',
    'Shipping tax treatment is not configured.',
    'Stripe Checkout automatic_tax remains disabled.',
  ],
} as const;
