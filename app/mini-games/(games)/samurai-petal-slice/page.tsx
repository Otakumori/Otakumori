import { generateSEO } from '@/app/lib/seo';
import dynamic from 'next/dynamic';

const SamuraiSliceGame = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Samurai Petal Slice...</p>
      </div>
    </div>
  ),
});

export function generateMetadata() {
  return generateSEO({
    title: 'Samurai Petal Slice | Otaku-mori',
    description: "Draw the Tetsusaiga's arc…",
    url: '/mini-games/samurai-petal-slice',
  });
}

export default function SamuraiPetalSlicePage() {
  return <SamuraiSliceGame />;
}
