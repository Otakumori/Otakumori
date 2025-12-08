import { generateSEO } from '@/app/lib/seo';
import GameShell from '../_shared/GameShell';
import Scene from './Scene';

export function generateMetadata() {
  return generateSEO({
    title: 'Bubble Ragdoll',
    description: 'Play mini-games and earn rewards',
    url: '/mini-games/bubble-ragdoll',
  });
}
export default function Page() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <GameShell gameKey="bubble-ragdoll" title="Bubble Ragdoll">
        <Scene />
      </GameShell>
    </div>
  );
}
