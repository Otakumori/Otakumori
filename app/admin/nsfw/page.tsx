import { generateSEO } from '@/app/lib/seo';
import { requireAdmin } from '@/app/lib/auth/admin';
import { AdminLayout } from '@/components/admin/AdminNav';
import NSFWPageClient from './NSFWPageClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\admin\nsfw\page.tsx',
  });
}
export default async function AdminNSFWPage() {
  await requireAdmin();

  return (
    <AdminLayout>
      <NSFWPageClient />
    </AdminLayout>
  );
}
