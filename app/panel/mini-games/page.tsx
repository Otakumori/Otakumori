
import { generateSEO } from '@/app/lib/seo';
import MiniGamesPage from '@/app/mini-games/page';

export function generateMetadata() {
  return generateSEO({
    title: 'Mini Games',
    description: 'Play mini-games and earn rewards',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\panel\mini-games\page.tsx',
  });
}
export default function MiniGamesPanel() {
  return <MiniGamesPage />;
}
