export const metadata = { title: 'Mini-Games | Otakumori' };

import HubClient from './HubClient';

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <HubClient />
    </main>
  );
}
