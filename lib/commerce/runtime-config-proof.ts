import { buildCommerceRuntimeStatus } from '@/lib/commerce/runtime-status';

export type RuntimeConfigProof = {
  clerkServerConfigured: boolean;
  clerkPublishableConfigured: boolean;
  upstashConfigured: boolean;
  databaseConfigured: boolean;
  stripeMode: 'test' | 'live' | 'unknown';
  stripeWebhookConfigured: boolean;
  fulfillmentDryRunEnabled: boolean;
  fulfillmentProvider: 'printify' | 'manual' | 'disabled' | 'unknown';
  deploymentBypassConfigured: boolean | 'not_app_env';
  environment: 'preview' | 'production' | 'development' | 'unknown';
  commerceProofSafe: boolean;
  reasons: string[];
};

export type RuntimeConfigProofInput = {
  nodeEnv?: string;
  vercelEnv?: string;
  clerkSecretKey?: string;
  clerkPublishableKey?: string;
  upstashRestUrl?: string;
  upstashRestToken?: string;
  databaseUrl?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  fulfillmentDryRun?: string;
  stripeWebhookFulfillmentDryRun?: string;
  fulfillmentProvider?: string;
  allowLiveKeysInNonProd?: string;
  allowTestKeysInProduction?: string;
};

export type RuntimeHealthProof = {
  ok: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  databaseHealthy: boolean;
};

export type DeployedRuntimeProofEvaluation = {
  ok: boolean;
  reasons: string[];
};

function hasValue(value?: string | null) {
  return (value ?? '').trim().length > 0;
}

export function buildRuntimeConfigProof(input: RuntimeConfigProofInput): RuntimeConfigProof {
  const commerce = buildCommerceRuntimeStatus({
    nodeEnv: input.nodeEnv,
    vercelEnv: input.vercelEnv,
    stripeSecretKey: input.stripeSecretKey,
    fulfillmentDryRun: input.fulfillmentDryRun,
    stripeWebhookFulfillmentDryRun: input.stripeWebhookFulfillmentDryRun,
    fulfillmentProvider: input.fulfillmentProvider,
    allowLiveKeysInNonProd: input.allowLiveKeysInNonProd,
    allowTestKeysInProduction: input.allowTestKeysInProduction,
  });

  const proof = {
    clerkServerConfigured: hasValue(input.clerkSecretKey),
    clerkPublishableConfigured: hasValue(input.clerkPublishableKey),
    upstashConfigured: hasValue(input.upstashRestUrl) && hasValue(input.upstashRestToken),
    databaseConfigured: hasValue(input.databaseUrl),
    stripeMode: commerce.stripeMode,
    stripeWebhookConfigured: hasValue(input.stripeWebhookSecret),
    fulfillmentDryRunEnabled: commerce.fulfillmentDryRunEnabled,
    fulfillmentProvider: commerce.fulfillmentProvider,
    deploymentBypassConfigured: 'not_app_env' as const,
    environment: commerce.environment,
    commerceProofSafe: false,
    reasons: [...commerce.reasons],
  };

  if (!proof.clerkServerConfigured) proof.reasons.push('clerk_server_not_configured');
  if (!proof.clerkPublishableConfigured) proof.reasons.push('clerk_publishable_not_configured');
  if (!proof.upstashConfigured) proof.reasons.push('upstash_not_configured');
  if (!proof.databaseConfigured) proof.reasons.push('database_not_configured');
  if (!proof.stripeWebhookConfigured) proof.reasons.push('stripe_webhook_not_configured');

  proof.commerceProofSafe =
    commerce.commerceProofSafe &&
    proof.clerkServerConfigured &&
    proof.clerkPublishableConfigured &&
    proof.upstashConfigured &&
    proof.databaseConfigured &&
    proof.stripeWebhookConfigured;

  return proof;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseRuntimeConfigProof(value: string | undefined): RuntimeConfigProof | null {
  if (!value?.trim()) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed) || !Array.isArray(parsed.reasons)) return null;

    const provider = parsed.fulfillmentProvider;
    const environment = parsed.environment;
    const stripeMode = parsed.stripeMode;
    const deploymentBypassConfigured = parsed.deploymentBypassConfigured;

    if (
      !['printify', 'manual', 'disabled', 'unknown'].includes(String(provider)) ||
      !['preview', 'production', 'development', 'unknown'].includes(String(environment)) ||
      !['test', 'live', 'unknown'].includes(String(stripeMode)) ||
      ![true, false, 'not_app_env'].includes(deploymentBypassConfigured as boolean | string)
    ) {
      return null;
    }

    const booleanKeys = [
      'clerkServerConfigured',
      'clerkPublishableConfigured',
      'upstashConfigured',
      'databaseConfigured',
      'stripeWebhookConfigured',
      'fulfillmentDryRunEnabled',
      'commerceProofSafe',
    ] as const;

    if (booleanKeys.some((key) => typeof parsed[key] !== 'boolean')) return null;
    if (parsed.reasons.some((reason) => typeof reason !== 'string')) return null;

    return parsed as RuntimeConfigProof;
  } catch {
    return null;
  }
}

export function parseRuntimeHealthProof(value: string | undefined): RuntimeHealthProof | null {
  if (!value?.trim()) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed) || typeof parsed.ok !== 'boolean') return null;

    const status = ['healthy', 'degraded', 'unhealthy'].includes(String(parsed.status))
      ? (parsed.status as RuntimeHealthProof['status'])
      : 'unknown';
    const checks = isRecord(parsed.checks) ? parsed.checks : {};
    const database = isRecord(checks.database) ? checks.database : {};

    return {
      ok: parsed.ok,
      status,
      databaseHealthy: database.status === 'pass',
    };
  } catch {
    return null;
  }
}

export function evaluateDeployedRuntimeProof(
  runtime: RuntimeConfigProof,
  health: RuntimeHealthProof,
): DeployedRuntimeProofEvaluation {
  const reasons: string[] = [];

  if (runtime.environment !== 'preview') reasons.push('environment_is_not_preview');
  if (!runtime.clerkServerConfigured) reasons.push('clerk_server_not_configured');
  if (!runtime.clerkPublishableConfigured) reasons.push('clerk_publishable_not_configured');
  if (!runtime.upstashConfigured) reasons.push('upstash_not_configured');
  if (!runtime.databaseConfigured) reasons.push('database_not_configured');
  if (runtime.stripeMode !== 'test') reasons.push('stripe_mode_is_not_test');
  if (!runtime.stripeWebhookConfigured) reasons.push('stripe_webhook_not_configured');
  if (!runtime.fulfillmentDryRunEnabled) reasons.push('fulfillment_dry_run_not_enabled');
  if (runtime.fulfillmentProvider === 'unknown') reasons.push('fulfillment_provider_unknown');
  if (!runtime.commerceProofSafe) reasons.push('commerce_proof_not_safe');
  if (!health.ok || health.status !== 'healthy') reasons.push('preview_health_not_healthy');
  if (!health.databaseHealthy) reasons.push('database_health_not_pass');

  return {
    ok: reasons.length === 0,
    reasons,
  };
}
