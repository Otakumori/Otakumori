import { type Metadata } from 'next';
import GameShell from '../_shared/GameShell';

export const metadata: Metadata = {
  title: 'Petal Storm Rhythm | Otakumori',
  description: 'Stormy rhythm playlist—precision timing for petals.',
};

export default function PetalStormRhythmPage() {
  return (
    <GameShell title="Petal Storm Rhythm" gameKey="petal-storm-rhythm">
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-purple-900">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⛈️</div>
          <h2 className="text-2xl font-bold mb-2">Petal Storm Rhythm</h2>
          <p className="text-gray-200 mb-6">Stormy rhythm playlist—precision timing for petals.</p>
          <div className="text-lg text-yellow-300">Coming Soon!</div>
          <p className="text-sm text-gray-300 mt-2">
            I didn't lose. Just ran out of health. – Edward Elric
          </p>
        </div>
      </div>
    </GameShell>
  );
}
