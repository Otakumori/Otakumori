import { generateSEO } from '@/app/lib/seo';
import RhythmWrapper from './rhythm-wrapper';

export function generateMetadata() {
  return generateSEO({
    title: 'Rhythm | Otaku-mori',
    description: 'Play rhythm mini-games and earn rewards',
    url: '/mini-games/rhythm',
  });
}
export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <RhythmWrapper />
    </main>
  );
}
