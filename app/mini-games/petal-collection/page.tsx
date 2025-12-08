import { generateSEO } from '@/app/lib/seo';
import GameShell from '../_shared/GameShell';

export function generateMetadata() {
  return generateSEO({
    title: 'Petal Collection',
    description: 'Collect falling petals and rack up combos.',
    url: '/mini-games/petal-collection',
  });
}
export default function PetalCollectionPage() {
  return (
    <GameShell title="Petal Collection" gameKey="petal-collection">
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-900 via-rose-800 to-purple-900">
        <div className="text-center text-white">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Petal Collection</h2>
          <p className="text-pink-200 mb-6">Collect falling petals and rack up combos.</p>
          <div className="text-lg text-yellow-300">Coming Soon!</div>
          <p className="text-sm text-pink-300 mt-2">
            I didn't lose. Just ran out of health. – Edward Elric
          </p>
        </div>
      </div>
    </GameShell>
  );
}
