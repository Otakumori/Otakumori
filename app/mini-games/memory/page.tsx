export const metadata = { title: 'Memory | Otakumori' };

import dynamic from 'next/dynamic';
const Client = dynamic(() => import('./memory.client'), {
  ssr: false,
  loading: () => <p>Loading Memory…</p>,
});

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl p-4">
      <Client />
    </main>
  );
}
