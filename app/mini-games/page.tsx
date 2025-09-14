// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import dynamic from 'next/dynamic';

const MiniGamesHome = dynamic(() => import('./_components/MiniGamesHome'), { ssr: false });

export const metadata = { title: 'Mini-Games | Otaku-mori' };

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10" style={{ ['--om-star-duration-base' as any]: '720s' }}>
      <MiniGamesHome />
    </main>
  );
}

