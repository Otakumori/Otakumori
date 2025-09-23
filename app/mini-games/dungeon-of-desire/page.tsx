import GameShell from '../_shared/GameShell';
import DungeonGame from './DungeonGame';

export const metadata = { title: 'Dungeon of Desire | Otaku-mori' };

export default function DungeonOfDesirePage() {
  return (
    <GameShell title="Dungeon of Desire" gameKey="dungeon-of-desire">
      <DungeonGame />
    </GameShell>
  );
}
