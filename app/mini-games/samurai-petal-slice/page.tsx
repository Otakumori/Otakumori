import { type Metadata } from 'next';
import GameShell from '../_shared/GameShell';
import SamuraiSlice from './Scene';

export const metadata: Metadata = {
  title: 'Samurai Petal Slice | Otakumori',
  description: "Draw the Tetsusaiga's arc…",
};

export default function SamuraiPetalSlicePage() {
  return (
    <GameShell title="Samurai Petal Slice" gameKey="samurai-petal-slice">
      <SamuraiSlice />
    </GameShell>
  );
}
