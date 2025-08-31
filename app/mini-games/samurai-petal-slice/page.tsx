/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable-line @next/next/no-img-element */
import GameShell from '../_shared/GameShell';
import Scene from './Scene';

export const metadata = { title: 'Samurai Petal Slice' };

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <GameShell gameKey="samurai-petal-slice" title="Samurai Petal Slice">
        <Scene />
      </GameShell>
    </div>
  );
}
