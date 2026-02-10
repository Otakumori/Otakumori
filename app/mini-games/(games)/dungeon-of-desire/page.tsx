import { generateSEO } from '@/app/lib/seo';
import DungeonOfDesireClient from './DungeonOfDesireClient';

export function generateMetadata() {
  return generateSEO({
    title: 'Dungeon of Desire | Otaku-mori',
    description: 'Descend into the dungeon. Survive rooms and claim rewards.',
    url: '/mini-games/dungeon-of-desire',
  });
}

export default function DungeonOfDesirePage() {
  return <DungeonOfDesireClient />;
}
