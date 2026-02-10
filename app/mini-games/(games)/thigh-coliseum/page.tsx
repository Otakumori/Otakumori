import { generateSEO } from '@/app/lib/seo';
import ThighColiseumClient from './ThighColiseumClient';

export function generateMetadata() {
  return generateSEO({
    title: 'Thigh Coliseum | Otaku-mori',
    description: 'Enter the arena. Win rounds and advance the bracket.',
    url: '/mini-games/thigh-coliseum',
  });
}

export default function ThighColiseumPage() {
  return <ThighColiseumClient />;
}
