import { generateSEO } from '@/app/lib/seo';
import PetalRunWrapper from './petal-run-wrapper';

export const metadata = { title: 'Petal Run | Otaku-mori' };

export function generateMetadata() {
  return generateSEO({
    title: 'Mini Games',
    description: 'Play mini-games and earn rewards',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\mini-games\petal-run\page.tsx',
  });
}
export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <PetalRunWrapper />
    </main>
  );
}
