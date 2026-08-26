import { generateSEO } from '@/app/lib/seo';
import MemoryMatchClient from './MemoryMatchClient';

export function generateMetadata() {
  return generateSEO({
    title: 'Memory Card / Defrag | Otaku-mori',
    description: 'Restore paired relic fragments in the Otaku-mori memory archive.',
    url: '/mini-games/memory-match',
  });
}

export default function MemoryMatchPage() {
  return <MemoryMatchClient />;
}
