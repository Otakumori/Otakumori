import { generateSEO } from '@/app/lib/seo';
import MemoryMatchClient from './MemoryMatchClient';

export function generateMetadata() {
  return generateSEO({
    title: 'Memory Match | Otaku-mori',
    description: 'Recall the faces bound by fate.',
    url: '/mini-games/memory-match',
  });
}

export default function MemoryMatchPage() {
  return <MemoryMatchClient />;
}
