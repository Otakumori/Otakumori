// DEPRECATED: This component is a duplicate. Use app\sign-in\[[...sign-in]]\page.tsx instead.
import dynamic from 'next/dynamic';

const GameCube = dynamic(() => import('./_components/GameCube'), {
  ssr: false,
  loading: () => <div className="p-4 text-gray-300">{<><span role='img' aria-label='emoji'>P</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>e</span><span role='img' aria-label='emoji'>p</span><span role='img' aria-label='emoji'>a</span><span role='img' aria-label='emoji'>r</span><span role='img' aria-label='emoji'>i</span><span role='img' aria-label='emoji'>n</span><span role='img' aria-label='emoji'>g</span>' '<span role='img' aria-label='emoji'>3</span><span role='img' aria-label='emoji'>D</span>…</>}</div>,
});

export const metadata = { title: 'Mini-Games | Otaku-mori' };

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <GameCube />
    </main>
  );
}
