import { generateSEO } from '@/app/lib/seo';
import GameShell from '../_shared/GameShell';
import Scene from './Scene';

export const metadata = { title: 'Quick Math | Otaku-mori' };

export function generateMetadata() {
  return generateSEO({
    title: 'Mini Games',
    description: 'Play mini-games and earn rewards',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\mini-games\quick-math\page.tsx',
  });
}
export default function Page() {
  return (
    <GameShell title="Quick Math" gameKey="quick-math">
      <Scene />
    </GameShell>
  );
}
