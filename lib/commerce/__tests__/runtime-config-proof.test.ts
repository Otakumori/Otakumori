import { describe, expect, it } from 'vitest';
import {
  buildRuntimeConfigProof,
  evaluateDeployedRuntimeProof,
  parseRuntimeConfigProof,
  parseRuntimeHealthProof,
} from '@/lib/commerce/runtime-config-proof';

describe('runtime config proof', () => {
  it('marks a fully configured Preview dry-run runtime safe', () => {
    const proof = buildRuntimeConfigProof({
      nodeEnv: 'production',
      vercelEnv: 'preview',
      clerkSecretKey: 'configured',
      clerkPublishableKey: 'configured',
      upstashRestUrl: 'configured',
      upstashRestToken: 'configured',
      databaseUrl: 'configured',
      stripeSecretKey: 'sk_test_placeholder',
      stripeWebhookSecret: 'configured',
      fulfillmentDryRun: 'true',
      fulfillmentProvider: 'printify',
    });

    expect(proof).toMatchObject({
      clerkServerConfigured: true,
      clerkPublishableConfigured: true,
      upstashConfigured: true,
      databaseConfigured: true,
      stripeMode: 'test',
      stripeWebhookConfigured: true,
      fulfillmentDryRunEnabled: true,
      fulfillmentProvider: 'printify',
      deploymentBypassConfigured: 'not_app_env',
      environment: 'preview',
      commerceProofSafe: true,
    });
  });

  it('rejects production and incomplete runtime proof', () => {
    const proof = buildRuntimeConfigProof({
      nodeEnv: 'production',
      vercelEnv: 'production',
      stripeSecretKey: 'sk_live_placeholder',
      fulfillmentDryRun: 'true',
      fulfillmentProvider: 'manual',
    });

    expect(proof.commerceProofSafe).toBe(false);
    expect(proof.reasons).toContain('environment_is_production');
    expect(proof.reasons).toContain('upstash_not_configured');
  });

  it('parses sanitized runtime and health proof for deployed readiness', () => {
    const runtime = parseRuntimeConfigProof(
      JSON.stringify({
        clerkServerConfigured: true,
        clerkPublishableConfigured: true,
        upstashConfigured: true,
        databaseConfigured: true,
        stripeMode: 'test',
        stripeWebhookConfigured: true,
        fulfillmentDryRunEnabled: true,
        fulfillmentProvider: 'printify',
        deploymentBypassConfigured: 'not_app_env',
        environment: 'preview',
        commerceProofSafe: true,
        reasons: ['environment_is_not_production'],
      }),
    );
    const health = parseRuntimeHealthProof(
      JSON.stringify({
        ok: true,
        status: 'healthy',
        checks: { database: { status: 'pass' } },
      }),
    );

    expect(runtime).not.toBeNull();
    expect(health).not.toBeNull();
    expect(evaluateDeployedRuntimeProof(runtime!, health!)).toEqual({ ok: true, reasons: [] });
  });

  it('rejects malformed or unsafe deployed proof', () => {
    expect(parseRuntimeConfigProof('{"stripeMode":"test"}')).toBeNull();

    const runtime = buildRuntimeConfigProof({
      nodeEnv: 'production',
      vercelEnv: 'preview',
      stripeSecretKey: 'sk_test_placeholder',
      fulfillmentDryRun: 'false',
      fulfillmentProvider: 'printify',
    });
    const health = parseRuntimeHealthProof(
      JSON.stringify({
        ok: true,
        status: 'healthy',
        checks: { database: { status: 'pass' } },
      }),
    );

    expect(evaluateDeployedRuntimeProof(runtime, health!).ok).toBe(false);
  });
});
