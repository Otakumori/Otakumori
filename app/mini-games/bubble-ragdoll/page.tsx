
import { generateSEO } from '@/app/lib/seo';
import GameShell from '../_shared/GameShell';
import Scene from './Scene';

export const metadata = { title: 'Bubble Ragdoll' };

export function generateMetadata() {
  return generateSEO({
    title: 'Mini Games',
    description: 'Play mini-games and earn rewards',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\mini-games\bubble-ragdoll\page.tsx',
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
