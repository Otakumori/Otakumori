'use client';

import dynamic from 'next/dynamic';

const Client = dynamic(() => import('./petal-run.client'), {
  ssr: false,
  loading: () => <p>Loading Petal Run…</p>,
});

export default function PetalRunWrapper() {
  return <Client />;
}
