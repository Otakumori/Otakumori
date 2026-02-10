import { generateSEO } from '@/app/lib/seo';
import SamuraiSliceClient from './SamuraiSliceClient';

export function generateMetadata() {
  return generateSEO({
    title: 'Samurai Petal Slice | Otaku-mori',
    description: "Draw the Tetsusaiga's arc…",
    url: '/mini-games/samurai-petal-slice',
  });
}

export default function SamuraiPetalSlicePage() {
  return <SamuraiSliceClient />;
}
