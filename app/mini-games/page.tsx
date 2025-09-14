// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import dynamic from 'next/dynamic';

const ConsoleCard = dynamic(() => import('./console/ConsoleCard'), { ssr: false });

export const metadata = { title: 'Mini-Games | Otakumori' };

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <ConsoleCard />
    </main>
  );
}

