'use client';

import dynamic from 'next/dynamic';

const Client = dynamic(() => import('./rhythm.client'), {
  ssr: false,
  loading: () => <p>Loading Rhythm…</p>,
});

export default function RhythmWrapper() {
  return <Client />;
}
