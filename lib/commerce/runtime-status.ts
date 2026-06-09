import {
  detectStripeKeyMode,
  guardStripeRuntimeUsage,
  resolveRuntimeTarget,
  type RuntimeTarget,
} from '@/lib/security/stripe-runtime-guard';

export type CommerceRuntimeEnvironment = RuntimeTarget | 'unknown';
export type CommerceRuntimeStripeMode = 'test' | 'live' | 'unknown';
export type CommerceRuntimeProvider = 'printify' | 'manual' | 'disabled' | 'unknown';

export type CommerceRuntimeStatusInput = {
  nodeEnv?: string;
  vercelEnv?: string;
  stripeSecretKey?: string;
  fulfillmentDryRun?: string;
  stripeWebhookFulfillmentDryRun?: string;
  fulfillmentProvider?: string;
  allowLiveKeysInNonProd?: string;
  allowTestKeysInProduction?: string;
};

export type CommerceRuntimeStatus = {
  fulfillmentDryRunEnabled: boolean;
  fulfillmentProvider: CommerceRuntimeProvider;
  legacyStripeWebhookDryRunAliasPresent: boolean;
  stripeMode: CommerceRuntimeStripeMode;
  environment: CommerceRuntimeEnvironment;
  commerceProofSafe: boolean;
  reasons: string[];
};

function isTruthy(value?: string | null) {
  return ['1', 'true'].includes((value ?? '').trim().toLowerCase());
}

function hasValue(value?: string | null) {
  return (value ?? '').trim().length > 0;
}

function resolveSafeProvider(value?: string): CommerceRuntimeProvider {
  const normalized = (value ?? 'manual').trim().toLowerCase();
  if (normalized === 'printify') return 'printify';
  if (normalized === 'manual') return 'manual';
  if (normalized === 'disabled') return 'disabled';
  return 'unknown';
}

function resolveSafeStripeMode(value?: string): CommerceRuntimeStripeMode {
  const mode = detectStripeKeyMode(value);
  if (mode === 'test') return 'test';
  if (mode === 'live') return 'live';
  return 'unknown';
}

export function buildCommerceRuntimeStatus(input: CommerceRuntimeStatusInput): CommerceRuntimeStatus {
  const environment = resolveRuntimeTarget(input.vercelEnv, input.nodeEnv);
  const stripeMode = resolveSafeStripeMode(input.stripeSecretKey);
  const fulfillmentDryRunEnabled =
    isTruthy(input.fulfillmentDryRun) || isTruthy(input.stripeWebhookFulfillmentDryRun);
  const legacyStripeWebhookDryRunAliasPresent = hasValue(input.stripeWebhookFulfillmentDryRun);
  const fulfillmentProvider = resolveSafeProvider(input.fulfillmentProvider);
  const reasons: string[] = [];

  const stripeGuard = guardStripeRuntimeUsage({
    secretKey: input.stripeSecretKey,
    vercelEnv: input.vercelEnv,
    nodeEnv: input.nodeEnv,
    allowLiveInNonProd: input.allowLiveKeysInNonProd === 'true',
    allowTestInProd: input.allowTestKeysInProduction === 'true',
  });

  if (environment === 'production') {
    reasons.push('environment_is_production');
  } else {
    reasons.push('environment_is_not_production');
  }

  if (stripeGuard.ok && stripeMode === 'test') {
    reasons.push('stripe_runtime_guard_allows_test_mode');
  } else if (!stripeGuard.ok) {
    reasons.push(`stripe_runtime_guard_blocked_${stripeGuard.reason}`);
  } else {
    reasons.push(`stripe_mode_${stripeMode}_is_not_safe_for_proof`);
  }

  if (fulfillmentDryRunEnabled) {
    reasons.push('fulfillment_dry_run_enabled');
  } else {
    reasons.push('fulfillment_dry_run_not_enabled');
  }

  if (fulfillmentProvider === 'unknown') {
    reasons.push('fulfillment_provider_unknown');
  } else {
    reasons.push('fulfillment_provider_known');
  }

  const commerceProofSafe =
    environment !== 'production' &&
    stripeGuard.ok &&
    stripeMode === 'test' &&
    fulfillmentDryRunEnabled &&
    fulfillmentProvider !== 'unknown';

  return {
    fulfillmentDryRunEnabled,
    fulfillmentProvider,
    legacyStripeWebhookDryRunAliasPresent,
    stripeMode,
    environment,
    commerceProofSafe,
    reasons,
  };
}
