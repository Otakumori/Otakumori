import GameShell from '../_shared/GameShell';
import ThighChaseGame from './ThighChaseGame';

export const metadata = { title: 'Thigh Colosseum | Otaku-mori' };

export default function ThighColiseumPage() {
  return (
    <GameShell title="Thigh Colosseum" gameKey="thigh-coliseum">
      <ThighChaseGame />
    </GameShell>
  );
}
