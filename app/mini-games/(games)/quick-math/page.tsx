import { generateSEO } from '@/app/lib/seo';
import dynamic from 'next/dynamic';

const QuickMathGame = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Quick Math...</p>
      </div>
    </div>
  ),
});

export function generateMetadata() {
  return generateSEO({
    title: 'Quick Math',
    description: 'Answer fast. Pressure builds with each correct streak.',
    url: '/mini-games/quick-math',
  });
}

export default function Page() {
  return <QuickMathGame />;
}
