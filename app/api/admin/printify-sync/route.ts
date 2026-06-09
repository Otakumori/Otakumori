import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Raw process.env guards only — importing @/env/server validates provider keys at module load.
/* eslint-disable no-restricted-syntax -- build-safe preview guards before dynamic provider imports */

function isPreviewRuntime(): boolean {
  return (
    process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENVIRONMENT === 'preview'
  );
}

function isStagingCatalogSyncEnabled(): boolean {
  return process.env.STAGING_CATALOG_SYNC_ENABLED === 'true';
}

function assertPrintifySyncAllowedInRuntime(): NextResponse | null {
  if (isPreviewRuntime() && !isStagingCatalogSyncEnabled()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'STAGING_PRINTIFY_SYNC_DISABLED',
          message:
            'Printify catalog sync is disabled for Preview unless STAGING_CATALOG_SYNC_ENABLED=true is set for the safe staging target.',
          nextAction:
            'Configure Preview/staging with test-mode Stripe and safe provider credentials before syncing catalog data.',
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

function assertPrintifyProviderEnv(): NextResponse | null {
  const missingKeys = missingPrintifyEnvKeys();

  if (missingKeys.length === 0) {
    return null;
  }

  return NextResponse.json(
    {
      ok: false,
      error: {
        code: 'PROVIDER_ENV_MISSING',
        message: `Printify catalog sync requires provider credentials that are not configured: ${missingKeys.join(', ')}.`,
        nextAction:
          'Add the missing Printify environment variables for this deployment, or disable catalog sync in Preview.',
      },
    },
    { status: 503 },
  );
}

export const POST = withAdminAuth(async (_request: NextRequest) => {
  const blocked = assertPrintifySyncAllowedInRuntime();
  if (blocked) return blocked;

  const providerEnvBlocked = assertPrintifyProviderEnv();
  if (providerEnvBlocked) return providerEnvBlocked;

  const { syncPrintifyCatalogFromProvider } = await import('@/lib/catalog/providerSync');
  const result = await syncPrintifyCatalogFromProvider();

  return NextResponse.json(
    {
      ok: result.ok,
      data: result,
    },
    { status: result.ok ? 200 : 207 },
  );
});
