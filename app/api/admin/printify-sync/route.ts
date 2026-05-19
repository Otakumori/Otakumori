import { requireAdminOrThrow } from '@/lib/adminGuard';
import { syncPrintifyCatalogFromProvider } from '@/lib/catalog/providerSync';

export const runtime = 'nodejs';

export async function POST() {
  await requireAdminOrThrow();
  const result = await syncPrintifyCatalogFromProvider();

  return Response.json(
    {
      ok: result.ok,
      data: result,
    },
    { status: result.ok ? 200 : 207 },
  );
}
