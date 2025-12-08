
import { generateSEO } from '@/app/lib/seo';
import MiniGamesPage from '@/app/mini-games/page';

export function generateMetadata() {
  return generateSEO({
    title: 'Mini Games',
    description: 'Play mini-games and earn rewards',
    url: '/panel/mini-games',
  });
}
export default function MiniGamesPanel() {
  return <MiniGamesPage />;
}
