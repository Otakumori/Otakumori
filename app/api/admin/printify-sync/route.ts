import { requireAdminOrThrow } from '@/lib/adminGuard';
import { syncPrintifyCatalogFromProvider } from '@/lib/catalog/providerSync';
import { env } from '@/env/server';

export const runtime = 'nodejs';

export async function POST() {
  await requireAdminOrThrow();

  if (
    (env.VERCEL_ENV === 'preview' || env.VERCEL_ENVIRONMENT === 'preview')
    && env.STAGING_CATALOG_SYNC_ENABLED !== 'true'
  ) {
    return Response.json(
      {
        ok: false,
        error: {
          code: 'STAGING_CATALOG_SYNC_DISABLED',
          message:
            'Printify catalog sync is disabled for Preview unless STAGING_CATALOG_SYNC_ENABLED=true is set for the safe staging target.',
          nextAction:
            'Configure Preview/staging with test-mode Stripe and safe provider credentials before syncing catalog data.',
        },
      },
      { status: 403 },
    );
  }

  const result = await syncPrintifyCatalogFromProvider();

  return Response.json(
    {
      ok: result.ok,
      data: result,
    },
    { status: result.ok ? 200 : 207 },
  );
}
