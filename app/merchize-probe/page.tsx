import { redirect } from 'next/navigation';
import { requireAdmin } from '@/app/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function MerchizeProbePage() {
  await requireAdmin();
  redirect('/admin/merchize');
}
