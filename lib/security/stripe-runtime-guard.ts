export type RuntimeTarget = 'development' | 'preview' | 'production';
export type StripeKeyMode = 'live' | 'test' | 'missing' | 'unknown';

export type StripeRuntimeGuardResult =
  | { ok: true; target: RuntimeTarget; mode: StripeKeyMode }
  | {
      ok: false;
      target: RuntimeTarget;
      mode: StripeKeyMode;
      reason:
        | 'missing_key'
        | 'live_key_in_non_prod'
        | 'test_key_in_production'
        | 'unknown_key_mode';
      message: string;
    };

export function resolveRuntimeTarget(
  vercelEnv: string | undefined,
  nodeEnv: string | undefined,
): RuntimeTarget {
  const normalizedVercel = (vercelEnv ?? '').trim().toLowerCase();
  if (normalizedVercel === 'production') return 'production';
  if (normalizedVercel === 'preview') return 'preview';
  if (normalizedVercel === 'development') return 'development';

  return nodeEnv === 'production' ? 'production' : 'development';
}

export function detectStripeKeyMode(secretKey: string | undefined): StripeKeyMode {
  const value = secretKey?.trim() ?? '';
  if (!value) return 'missing';

  if (value.startsWith('sk_live_') || value.startsWith('rk_live_')) return 'live';
  if (value.startsWith('sk_test_') || value.startsWith('rk_test_')) return 'test';

  return 'unknown';
}

export function guardStripeRuntimeUsage(params: {
  secretKey: string | undefined;
  vercelEnv: string | undefined;
  nodeEnv: string | undefined;
  allowLiveInNonProd?: boolean;
  allowTestInProd?: boolean;
}): StripeRuntimeGuardResult {
  const target = resolveRuntimeTarget(params.vercelEnv, params.nodeEnv);
  const mode = detectStripeKeyMode(params.secretKey);

  if (mode === 'missing') {
    return {
      ok: false,
      target,
      mode,
      reason: 'missing_key',
      message: 'Missing STRIPE_SECRET_KEY.',
    };
  }

  if (mode === 'unknown') {
    return {
      ok: false,
      target,
      mode,
      reason: 'unknown_key_mode',
      message:
        'Unrecognized STRIPE_SECRET_KEY prefix. Expected sk_test_/sk_live_/rk_test_/rk_live_.',
    };
  }

  const allowLiveInNonProd = params.allowLiveInNonProd === true;
  const allowTestInProd = params.allowTestInProd === true;

  if (target !== 'production' && mode === 'live' && !allowLiveInNonProd) {
    return {
      ok: false,
      target,
      mode,
      reason: 'live_key_in_non_prod',
      message:
        'Refusing live Stripe key outside production. Set ALLOW_LIVE_KEYS_IN_NON_PROD=true only for controlled validation windows.',
    };
  }

  if (target === 'production' && mode === 'test' && !allowTestInProd) {
    return {
      ok: false,
      target,
      mode,
      reason: 'test_key_in_production',
      message:
        'Refusing test Stripe key in production. Set ALLOW_TEST_KEYS_IN_PRODUCTION=true only for temporary maintenance.',
    };
  }

  return { ok: true, target, mode };
}
