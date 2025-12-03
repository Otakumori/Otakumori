import { generateSEO } from '@/app/lib/seo';
import MemoryWrapper from './memory-wrapper';

export const metadata = { title: 'Memory | Otaku-mori' };

export function generateMetadata() {
  return generateSEO({
    title: 'Mini Games',
    description: 'Play mini-games and earn rewards',
    url: '/C:\Users\ap190\Contacts\Desktop\Documents\GitHub\Otakumori\app\mini-games\memory\page.tsx',
  });
}
export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <MemoryWrapper />
    </main>
  );
}
