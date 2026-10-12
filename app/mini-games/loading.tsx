import { MoriGameThreshold } from '@/app/components/mori/MoriGameSystem';
import { MoriSystemState } from '@/app/components/mori/MoriProduction';

export default function Loading() {
  return (
    <main className="game-threshold-route-state">
      <MoriGameThreshold className="game-threshold-state" label="Game loading state">
        <MoriSystemState
          description="Preparing the next playable space."
          headingLevel={1}
          state="loading"
          title="Opening the game threshold"
        />
      </MoriGameThreshold>
    </main>
  );
}
