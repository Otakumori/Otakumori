import { generateSEO } from '@/app/lib/seo';
import GameShell from '../_shared/GameShell';
import MaidCafeGame from './MaidCafeGame';

export function generateMetadata() {
  return generateSEO({
    title: 'Maid Café Manager',
    description: 'Play mini-games and earn rewards',
    url: '/mini-games/maid-cafe-manager',
  });
}
export default function MaidCafeManagerPage() {
  return (
    <GameShell title="Maid Café Manager" gameKey="maid-cafe-manager">
      <MaidCafeGame />
    </GameShell>
  );
}
