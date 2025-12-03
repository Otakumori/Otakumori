import { generateSEO } from '@/app/lib/seo';
import GameShell from '../_shared/GameShell';
import SamuraiSlice from './Scene';

export function generateMetadata() {
  return generateSEO({
    title: 'Samurai Petal Slice | Otaku-mori',
    description: "Draw the Tetsusaiga's arc…",
    url: '/mini-games/samurai-petal-slice',
  });
}
export default function SamuraiPetalSlicePage() {
  return (
    <GameShell title="Samurai Petal Slice" gameKey="samurai-petal-slice">
      <SamuraiSlice />
    </GameShell>
  );
}
