import { type Metadata } from 'next';
import GameShell from '../_shared/GameShell';

export const metadata: Metadata = {
  title: 'Bubble-Pop Gacha | Otakumori',
  description: 'Pop for spy-craft secrets…',
};

export default function BubblePopGachaPage() {
  return (
    <GameShell title="Bubble-Pop Gacha" gameKey="bubble-pop-gacha">
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-cyan-800 to-teal-900">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🫧</div>
          <h2 className="text-2xl font-bold mb-2">Bubble-Pop Gacha</h2>
          <p className="text-cyan-200 mb-6">Pop for spy-craft secrets…</p>
          <div className="text-lg text-yellow-300">Coming Soon!</div>
          <p className="text-sm text-cyan-300 mt-2">
            I didn't lose. Just ran out of health. – Edward Elric
          </p>
        </div>
      </div>
    </GameShell>
  );
}
