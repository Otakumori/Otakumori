import { generateSEO } from '@/app/lib/seo';
import PetalRunWrapper from './petal-run-wrapper';

export function generateMetadata() {
  return generateSEO({
    title: 'Petal Run',
    description: 'Play mini-games and earn rewards',
    url: '/mini-games/petal-run',
  });
}
export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <PetalRunWrapper />
    </main>
  );
}
