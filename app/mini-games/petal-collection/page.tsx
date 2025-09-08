import GameShell from '../_shared/GameShell';
import LeaderboardPanel from '../_shared/LeaderboardPanel';
import BootScreen from '../../components/games/BootScreen';
import Scene from './Scene';

export const metadata = { title: 'Petal Collection' };

export default function Page() {
  return (
    <BootScreen gameId="petal-collection">
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <GameShell
          gameKey="petal-collection"
          title="Petal Collection"
          resultsExtra={<LeaderboardPanel game="petal-collection" />}
        >
          <Scene />
        </GameShell>
      </div>
    </BootScreen>
  );
}
