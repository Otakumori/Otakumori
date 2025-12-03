import { requireAdmin } from '@/app/lib/auth/admin';
import { AdminLayout } from '@/components/admin/AdminNav';
import NSFWPageClient from './NSFWPageClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

);
}
export default async function AdminNSFWPage() {
  await requireAdmin();

  return (
    <AdminLayout>
      <NSFWPageClient />
    </AdminLayout>
  );
}
