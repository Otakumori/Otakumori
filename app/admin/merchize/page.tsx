import { requireAdmin } from '@/app/lib/auth/admin';
import MerchizeAdminClient from './MerchizeAdminClient';

export const dynamic = 'force-dynamic';

export default async function MerchizeAdminPage() {
  await requireAdmin();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">Merchize</h1>
        <p className="mt-2 text-sm text-white/70">
          Read-only Merchize diagnostics for validating the parallel provider bridge without
          disturbing the existing Printify catalog.
        </p>
      </div>

      <MerchizeAdminClient />
    </main>
  );
}
