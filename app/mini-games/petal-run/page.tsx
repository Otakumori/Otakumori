export const metadata = { title: 'Petal Run | Otakumori' };

import dynamic from 'next/dynamic';
const Client = dynamic(() => import('./petal-run.client'), { ssr: false, loading: () => <p>Loading Petal Run…</p> });

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <Client />
    </main>
  );
}

