import { generateSEO } from '@/app/lib/seo';
import GameShell from '../_shared/GameShell';
import Scene from './Scene';

export function generateMetadata() {
  return generateSEO({
    title: 'Quick Math',
    description: 'Play mini-games and earn rewards',
    url: '/mini-games/quick-math',
  });
}
export default function Page() {
  return (
    <GameShell title="Quick Math" gameKey="quick-math">
      <Scene />
    </GameShell>
  );
}
