
import { generateSEO } from '@/app/lib/seo';
import PetalStorePage from '@/app/(site)/account/petals/page';

export function generateMetadata() {
  return generateSEO({
    title: 'Petal Store',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/panel/petal-store',
  });
}
export default function PetalStorePanel() {
  return <PetalStorePage />;
}
