'use client';

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

export default function BubbleRagdollClient() {
  return <BubbleRagdollGame />;
}

