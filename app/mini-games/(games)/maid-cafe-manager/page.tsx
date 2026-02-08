import { generateSEO } from '@/app/lib/seo';
import dynamic from 'next/dynamic';

const MaidCafeManagerGame = dynamic(() => import('./Game'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading Maid Café Manager...</p>
      </div>
    </div>
  ),
});

export function generateMetadata() {
  return generateSEO({
    title: 'Maid Café Manager',
    description: 'Manage shifts and keep guests smiling.',
    url: '/mini-games/maid-cafe-manager',
  });
}

export default function MaidCafeManagerPage() {
  return <MaidCafeManagerGame />;
}
