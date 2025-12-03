
import { generateSEO } from '@/app/lib/seo';
import PetalStorePage from '@/app/account/petals/page';

export function generateMetadata() {
  return generateSEO({
    title: 'Page',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\panel\petal-store\page.tsx',
  });
}
export default function PetalStorePanel() {
  return <PetalStorePage />;
}
