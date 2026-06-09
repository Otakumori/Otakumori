import { describe, expect, it } from 'vitest';
import { buildCommerceRuntimeStatus } from '@/lib/commerce/runtime-status';

describe('commerce runtime status', () => {
  it('marks preview test mode with fulfillment dry-run as proof safe', () => {
    const status = buildCommerceRuntimeStatus({
      nodeEnv: 'production',
      vercelEnv: 'preview',
      stripeSecretKey: 'sk_test_placeholder',
      fulfillmentDryRun: 'true',
      fulfillmentProvider: 'printify',
    });

    expect(status).toMatchObject({
      fulfillmentDryRunEnabled: true,
      fulfillmentProvider: 'printify',
      legacyStripeWebhookDryRunAliasPresent: false,
      stripeMode: 'test',
      environment: 'preview',
      commerceProofSafe: true,
    });
    expect(status.reasons).toContain('fulfillment_dry_run_enabled');
  });

  it('keeps production from being proof safe even when dry-run is enabled', () => {
    const status = buildCommerceRuntimeStatus({
      nodeEnv: 'production',
      vercelEnv: 'production',
      stripeSecretKey: 'sk_live_placeholder',
      fulfillmentDryRun: '1',
      fulfillmentProvider: 'manual',
    });

    expect(status.commerceProofSafe).toBe(false);
    expect(status.environment).toBe('production');
    expect(status.reasons).toContain('environment_is_production');
  });

  it('treats unsupported providers as unknown', () => {
    const status = buildCommerceRuntimeStatus({
      nodeEnv: 'production',
      vercelEnv: 'preview',
      stripeSecretKey: 'sk_test_placeholder',
      fulfillmentDryRun: 'true',
      fulfillmentProvider: 'merchize',
    });

    expect(status.fulfillmentProvider).toBe('unknown');
    expect(status.commerceProofSafe).toBe(false);
    expect(status.reasons).toContain('fulfillment_provider_unknown');
  });
});
