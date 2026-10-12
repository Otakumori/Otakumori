'use client';

import Link from 'next/link';

import { MoriGameThreshold } from '@/app/components/mori/MoriGameSystem';
import { MoriButton, MoriStatus } from '@/app/components/mori/MoriFoundation';
import { MoriArtifact } from '@/app/components/mori/MoriProduction';

interface GameTitleScreenProps {
  title: string;
  description?: string;
  instructions?: string[];
  onStart: () => void;
}

/**
 * Game Title Screen Component
 * "Tap to Start" view with game info using design system variables
 */
export function GameTitleScreen({
  title,
  description,
  instructions = [],
  onStart,
}: GameTitleScreenProps) {
  return (
    <MoriGameThreshold className="game-threshold-screen" label={`${title} launch threshold`}>
      <MoriArtifact className="game-threshold-panel" family="game">
        <div className="game-threshold-panel__header">
          <MoriStatus tone="neutral">Ready to launch</MoriStatus>
          <span aria-hidden="true" className="game-threshold-panel__channel" />
        </div>
        <div className="game-threshold-panel__copy">
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {instructions.length > 0 ? (
          <section aria-labelledby="game-threshold-instructions" className="game-threshold-instructions">
            <h2 id="game-threshold-instructions">How to play</h2>
            <ul>
              {instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </section>
        ) : null}
        <div className="game-threshold-actions">
          <MoriButton onClick={onStart}>Start game</MoriButton>
          <Link
            className="mori-foundation-button"
            data-mori-variant="secondary"
            href="/mini-games"
          >
            Return to games
          </Link>
        </div>
      </MoriArtifact>
    </MoriGameThreshold>
  );
}

