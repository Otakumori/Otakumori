import { type Metadata } from 'next';
import GameShell from '../_shared/GameShell';

export const metadata: Metadata = {
  title: 'Anime Memory Match | Otakumori',
  description: 'Recall the faces bound by fate.',
};

export default function AnimeMemoryMatchPage() {
  return (
    <GameShell title="Anime Memory Match" gameKey="anime-memory-match">
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🧠</div>
          <h2 className="text-2xl font-bold mb-2">Anime Memory Match</h2>
          <p className="text-purple-200 mb-6">Recall the faces bound by fate.</p>
          <div className="text-lg text-yellow-300">Coming Soon!</div>
          <p className="text-sm text-purple-300 mt-2">
            I didn't lose. Just ran out of health. – Edward Elric
          </p>
        </div>
      </div>
    </GameShell>
  );
}
