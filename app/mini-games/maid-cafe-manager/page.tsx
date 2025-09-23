import GameShell from '../_shared/GameShell';
import MaidCafeGame from './MaidCafeGame';

export const metadata = { title: 'Maid Café Manager | Otaku-mori' };

export default function MaidCafeManagerPage() {
  return (
    <GameShell title="Maid Café Manager" gameKey="maid-cafe-manager">
      <MaidCafeGame />
    </GameShell>
  );
}
