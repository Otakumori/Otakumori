'use client';

import { MoriButton } from '@/app/components/mori/MoriFoundation';
import { MoriGameHud, MoriGameOverlay, type MoriGameMetric } from '@/app/components/mori/MoriGameSystem';

import type { GameSessionController, GameSessionResult } from './GameSession';

export function GamePlatformHud<TResult extends GameSessionResult>({
  metrics,
  progress,
  progressLabel,
  session,
}: {
  metrics: MoriGameMetric[];
  progress?: number;
  progressLabel?: string;
  session: GameSessionController<TResult>;
}) {
  return (
    <div className="game-platform-hud" data-game-session-phase={session.phase}>
      <MoriGameHud
        metrics={metrics}
        progress={progress}
        {...(progressLabel ? { progressLabel } : {})}
      />
      <nav aria-label="Game session controls" className="game-platform-controls">
        <MoriButton onClick={session.pause} variant="secondary">
          Pause
        </MoriButton>
        <MoriButton onClick={session.exit} variant="secondary">
          Exit
        </MoriButton>
      </nav>
    </div>
  );
}

export function GamePlatformControls<TResult extends GameSessionResult>({
  session,
  showPause = true,
}: {
  session: GameSessionController<TResult>;
  showPause?: boolean;
}) {
  return (
    <nav
      aria-label="Game session controls"
      className="game-platform-controls game-platform-controls--standalone"
      data-game-session-phase={session.phase}
    >
      {showPause ? (
        <MoriButton onClick={session.pause} variant="secondary">
          Pause
        </MoriButton>
      ) : null}
      <MoriButton onClick={session.exit} variant="secondary">
        Exit
      </MoriButton>
    </nav>
  );
}

export function GamePlatformPause<TResult extends GameSessionResult>({
  session,
  title,
}: {
  session: GameSessionController<TResult>;
  title: string;
}) {
  if (session.phase !== 'paused') return null;

  return (
    <MoriGameOverlay
      description="Progress is held until you resume or return to Mini-Games."
      onPrimary={session.resume}
      onSecondary={session.exit}
      primaryLabel="Resume"
      secondaryLabel="Return to Mini-Games"
      state="pause"
      title={`${title} paused`}
    />
  );
}

export function GameSessionAnnouncement<TResult extends GameSessionResult>({
  session,
}: {
  session: GameSessionController<TResult>;
}) {
  return (
    <p aria-live="polite" className="sr-only" data-game-session-announcement="true">
      Game session {session.phase}.
    </p>
  );
}
