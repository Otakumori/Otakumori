import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SyncProvider = 'printify' | 'merchize' | 'all';
type CatalogSyncStage =
  | 'runtime_guard'
  | 'provider_env_guard'
  | 'parse_body'
  | 'printify_sync'
  | 'diagnostics'
  | 'response';

function parseProvider(value: unknown): SyncProvider {
  return value === 'printify' || value === 'merchize' || value === 'all'
    ? value
    : 'all';
}

// Raw process.env guards only — importing @/env/server validates all provider keys at module load.
/* eslint-disable no-restricted-syntax -- build-safe preview guards before dynamic provider imports */

function isPreviewRuntime(): boolean {
  return (
    process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENVIRONMENT === 'preview'
  );
}

function isStagingCatalogSyncEnabled(): boolean {
  return process.env.STAGING_CATALOG_SYNC_ENABLED === 'true';
}

function assertCatalogSyncAllowedInRuntime(): NextResponse | null {
  if (isPreviewRuntime() && !isStagingCatalogSyncEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'STAGING_CATALOG_SYNC_DISABLED',
          message:
            'Catalog sync is disabled for Preview unless STAGING_CATALOG_SYNC_ENABLED=true is set for the safe staging target.',
          nextAction:
            'Configure Preview/staging with test-mode Stripe, safe provider credentials, and STAGING_CATALOG_SYNC_ENABLED=true before syncing catalog data.',
        },
      },
      { status: 403 },
    );
  }

  return null;
}

function missingPrintifyEnvKeys(): string[] {
  const missing: string[] = [];
  if (!process.env.PRINTIFY_API_KEY?.length) missing.push('PRINTIFY_API_KEY');
  if (!process.env.PRINTIFY_SHOP_ID?.length) missing.push('PRINTIFY_SHOP_ID');
  return missing;
}

function missingMerchizeEnvKeys(): string[] {
  const missing: string[] = [];
  const hasToken = Boolean(
    process.env.MERCHIZE_ACCESS_TOKEN?.length || process.env.MERCHIZE_API_TOKEN?.length,
  );
  const hasUrl = Boolean(
    process.env.MERCHIZE_API_URL?.length ||
      process.env.MERCHIZE_STORE_API_URL?.length ||
      process.env.NEXT_PUBLIC_MERCHIZE_API_URL?.length,
  );

  if (!hasToken) {
    missing.push('MERCHIZE_ACCESS_TOKEN or MERCHIZE_API_TOKEN');
  }
  if (!hasUrl) {
    missing.push('MERCHIZE_API_URL or MERCHIZE_STORE_API_URL');
  }

  return missing;
}

function isMerchizeSyncConfigured(): boolean {
  return missingMerchizeEnvKeys().length === 0;
}

function assertProviderEnvForSync(provider: SyncProvider): NextResponse | null {
  const missingKeys: string[] = [];

  if (provider === 'printify' || provider === 'all') {
    missingKeys.push(...missingPrintifyEnvKeys());
  }
  if (provider === 'merchize') {
    missingKeys.push(...missingMerchizeEnvKeys());
  }

  if (missingKeys.length === 0) {
    return null;
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'PROVIDER_ENV_MISSING',
        message: `Catalog sync requires provider credentials that are not configured: ${missingKeys.join(', ')}.`,
        nextAction:
          'Add the missing provider environment variables for this deployment, or disable catalog sync in Preview.',
      },
    },
    { status: 503 },
  );
}

function sanitizeCatalogSyncError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/(sk|pk)_(live|test)_[A-Za-z0-9_]+/gi, '$1_$2_[redacted]')
    .replace(/(postgres(?:ql)?:\/\/)[^\s"']+/gi, '$1[redacted]')
    .slice(0, 500);
}

export const GET = withAdminAuth(async (_request: NextRequest) => {
  const blocked = assertCatalogSyncAllowedInRuntime();
  if (blocked) return blocked;

  const providerEnvBlocked = assertProviderEnvForSync('printify');
  if (providerEnvBlocked) return providerEnvBlocked;

  const { getProviderCatalogDiagnostics } = await import('@/lib/catalog/providerSync');
  const diagnostics = await getProviderCatalogDiagnostics();

  return NextResponse.json({
    ok: true,
    data: {
      checkedAt: new Date().toISOString(),
      providers: diagnostics,
      architecture: 'providers_to_local_catalog_to_stripe_price_data',
    },
  });
});

export const POST = withAdminAuth(async (request: NextRequest) => {
  let stage: CatalogSyncStage = 'runtime_guard';

  try {
    const blocked = assertCatalogSyncAllowedInRuntime();
    if (blocked) return blocked;

    stage = 'parse_body';
    let body: unknown = null;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const provider = parseProvider(
      body && typeof body === 'object' && !Array.isArray(body)
        ? (body as { provider?: unknown }).provider
        : undefined,
    );

    stage = 'provider_env_guard';
    const providerEnvBlocked = assertProviderEnvForSync(provider);
    if (providerEnvBlocked) return providerEnvBlocked;

    const {
      getProviderCatalogDiagnostics,
      syncMerchizeCatalogFromProvider,
      syncPrintifyCatalogFromProvider,
    } = await import('@/lib/catalog/providerSync');

    const results = [];
    if (provider === 'printify' || provider === 'all') {
      stage = 'printify_sync';
      results.push(await syncPrintifyCatalogFromProvider());
    }
    if (provider === 'merchize' || (provider === 'all' && isMerchizeSyncConfigured())) {
      stage = 'printify_sync';
      results.push(await syncMerchizeCatalogFromProvider());
    }

    stage = 'diagnostics';
    const diagnostics = await getProviderCatalogDiagnostics();
    const failed = results.filter((result) => !result.ok);

    stage = 'response';
    return NextResponse.json(
      {
        ok: failed.length === 0,
        data: {
          provider,
          results,
          diagnostics,
          nextAction:
            failed.length > 0
              ? 'Review sanitized provider sync errors and provider env configuration before launch.'
              : 'Catalog sync completed. Verify storefront products and checkout with a real test order.',
        },
      },
      { status: failed.length > 0 ? 207 : 200 },
    );
  } catch (error) {
    const message = sanitizeCatalogSyncError(error);
    const { logger } = await import('@/app/lib/logger');
    logger.error(
      'Catalog sync failed',
      undefined,
      { stage },
      error instanceof Error ? error : new Error(String(error)),
    );

    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'CATALOG_SYNC_FAILED',
          stage,
          message,
        },
      },
      { status: 500 },
    );
  }
});
