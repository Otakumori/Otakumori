import { generateSEO } from '@/app/lib/seo';
import GameShell from '../_shared/GameShell';
import MaidCafeGame from './MaidCafeGame';

export const metadata = { title: 'Maid Café Manager | Otaku-mori' };

export function generateMetadata() {
  return generateSEO({
    title: 'Mini Games',
    description: 'Play mini-games and earn rewards',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\mini-games\maid-cafe-manager\page.tsx',
  });
}
export default function MaidCafeManagerPage() {
  return (
    <GameShell title="Maid Café Manager" gameKey="maid-cafe-manager">
      <MaidCafeGame />
    </GameShell>
  );
}
