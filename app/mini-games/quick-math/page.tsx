import GameShell from '../_shared/GameShell';
import Scene from './Scene';

export const metadata = { title: 'Quick Math | Otaku-mori' };

export default function Page() {
  return (
    <GameShell title="Quick Math" gameKey="quick-math">
      <Scene />
    </GameShell>
  );
}
