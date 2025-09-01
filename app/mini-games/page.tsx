import dynamic from 'next/dynamic';

const GameCube = dynamic(() => import('./_components/GameCube'), {
  ssr: false,
  loading: () => <div className="p-4 text-gray-300">Preparing 3D…</div>,
});

export const metadata = { title: 'Mini-Games | Otaku-mori' };

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <GameCube />
    </main>
  );
}
