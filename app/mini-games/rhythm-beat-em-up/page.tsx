import { type Metadata } from 'next';
import GameShell from '../_shared/GameShell';

export const metadata: Metadata = {
  title: 'Rhythm Beat-Em-Up | Otakumori',
  description: "Sync to the Moon Prism's pulse.",
};

export default function RhythmBeatEmUpPage() {
  return (
    <GameShell title="Rhythm Beat-Em-Up" gameKey="rhythm-beat-em-up">
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-900 via-rose-800 to-red-900">
        <div className="text-center text-white">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Rhythm Beat-Em-Up</h2>
          <p className="text-pink-200 mb-6">Sync to the Moon Prism's pulse.</p>
          <div className="text-lg text-yellow-300">Coming Soon!</div>
          <p className="text-sm text-pink-300 mt-2">
            I didn't lose. Just ran out of health. – Edward Elric
          </p>
        </div>
      </div>
    </GameShell>
  );
}
