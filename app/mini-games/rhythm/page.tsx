export const metadata = { title: 'Rhythm | Otakumori' };

import dynamic from 'next/dynamic';
const Client = dynamic(() => import('./rhythm.client'), { ssr: false, loading: () => <p>Loading Rhythm…</p> });

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <Client />
    </main>
  );
}

