import { generateSEO } from '@/app/lib/seo';
import HeroRoot from '@/app/components/hero/HeroRoot';

export const revalidate = 60;

export function generateMetadata() {
  return generateSEO({
    title: 'Welcome Home, Traveler — Otaku-mori',
    description: 'Anime x gaming shop + play — petals, runes, rewards.',
    url: '/',
  });
}

export default function HomePage() {
  return <HeroRoot />;
}
