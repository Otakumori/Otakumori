import { type NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/app/lib/auth/admin';
import {
  getProviderCatalogDiagnostics,
  syncMerchizeCatalogFromProvider,
  syncPrintifyCatalogFromProvider,
} from '@/lib/catalog/providerSync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SyncProvider = 'printify' | 'merchize' | 'all';

function parseProvider(value: unknown): SyncProvider {
  return value === 'printify' || value === 'merchize' || value === 'all'
    ? value
    : 'all';
}

export const GET = withAdminAuth(async (_request: NextRequest) => {
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

  const results = [];
  if (provider === 'printify' || provider === 'all') {
    results.push(await syncPrintifyCatalogFromProvider());
  }
  if (provider === 'merchize' || provider === 'all') {
    results.push(await syncMerchizeCatalogFromProvider());
  }

  const diagnostics = await getProviderCatalogDiagnostics();
  const failed = results.filter((result) => !result.ok);

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
});
