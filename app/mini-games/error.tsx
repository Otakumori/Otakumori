'use client';

import Link from 'next/link';
import { MoriGameThreshold } from '@/app/components/mori/MoriGameSystem';
import { MoriSystemState } from '@/app/components/mori/MoriProduction';

/**
 * Error boundary for mini-games route
 * Catches Server Component render errors and provides a graceful fallback UI
 */
export default function MiniGamesError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="game-threshold-route-state">
      <MoriGameThreshold className="game-threshold-state" label="Game recovery state">
        <MoriSystemState
          action={
            <div className="game-threshold-actions">
              <button className="mori-button-primary" onClick={reset} type="button">
                Try again
              </button>
              <Link
                className="mori-foundation-button"
                data-mori-variant="secondary"
                href="/mini-games"
              >
                Return to games
              </Link>
            </div>
          }
          description="We couldn’t open this playable space. Try again, or return to the game collection."
          headingLevel={1}
          state="error"
          title="This game threshold is unavailable"
        />
      </MoriGameThreshold>
    </main>
  );
}
