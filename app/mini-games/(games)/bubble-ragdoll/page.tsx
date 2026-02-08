import { generateSEO } from '@/app/lib/seo';
import dynamic from 'next/dynamic';

const BubbleRagdollGame = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Bubble Ragdoll...</p>
      </div>
    </div>
  ),
});

export function generateMetadata() {
  return generateSEO({
    title: 'Bubble Ragdoll',
    description: 'Toss the ragdoll into bubbles. Survive the chaos.',
    url: '/mini-games/bubble-ragdoll',
  });
}

export default function Page() {
  return <BubbleRagdollGame />;
}
