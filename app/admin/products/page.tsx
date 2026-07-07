import { requireAdmin } from '@/app/lib/auth/admin';
import ProductManagementClient from './ProductManagementClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminProductsPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-purple-950 to-black px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.26em] text-pink-200/70">Admin</p>
          <h1 className="mt-2 text-4xl font-semibold text-pink-100">Shop Product Management</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/65">
            Hide, restore, or archive products locally without mutating provider catalogs. Use this
            for storefront curation before considering any dangerous provider-side operation.
          </p>
        </div>
        <ProductManagementClient />
      </div>
    </main>
  );
}
