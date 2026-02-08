'use client';

import dynamic from 'next/dynamic';

const Client = dynamic(() => import('./memory.client'), {
  ssr: false,
  loading: () => <p>Loading Memory…</p>,
});

export default function MemoryWrapper() {
  return <Client />;
}
