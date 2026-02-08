import { generateSEO } from '@/app/lib/seo';
import dynamic from 'next/dynamic';

const MemoryMatchGame = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Memory Match...</p>
      </div>
    </div>
  ),
});

export function generateMetadata() {
  return generateSEO({
    title: 'Memory Match | Otaku-mori',
    description: 'Recall the faces bound by fate.',
    url: '/mini-games/memory-match',
  });
}

export default function MemoryMatchPage() {
  return <MemoryMatchGame />;
}
