import { generateSEO } from '@/app/lib/seo';
import MemoryWrapper from './memory-wrapper';

export function generateMetadata() {
  return generateSEO({
    title: 'Memory',
    description: 'Play mini-games and earn rewards',
    url: '/mini-games/memory',
  });
}
export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <MemoryWrapper />
    </main>
  );
}
