import { generateSEO } from '@/app/lib/seo';
import { redirect } from 'next/navigation';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\admin\rewards\page.tsx',
  });
}
export default function AdminRewardsPage() {
  redirect('/admin');
}
