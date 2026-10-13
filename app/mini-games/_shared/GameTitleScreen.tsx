'use client';

import Image from 'next/image';
import Link from 'next/link';

import { MoriGameThreshold } from '@/app/components/mori/MoriGameSystem';
import { MoriButton, MoriStatus } from '@/app/components/mori/MoriFoundation';
import { MoriArtifact } from '@/app/components/mori/MoriProduction';

interface GameTitleScreenProps {
  title: string;
  description?: string;
  instructions?: string[];
  artworkSrc?: string;
  inputLabel?: string;
  launchLabel?: string;
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
  artworkSrc,
  inputLabel,
  launchLabel = 'Start game',
  onStart,
}: GameTitleScreenProps) {
  const essentialInstructions = instructions.slice(0, 2);
  const additionalInstructions = instructions.slice(2);
  const monogram = title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

  return (
    <MoriGameThreshold className="game-threshold-screen" label={`${title} launch threshold`}>
      <MoriArtifact className="game-threshold-panel game-threshold-panel--launch" family="game">
        <figure className="game-threshold-focal" data-has-artwork={artworkSrc ? 'true' : 'false'}>
          <span aria-hidden="true" className="game-threshold-focal__orbit" />
          {artworkSrc ? (
            <Image
              alt=""
              className="game-threshold-focal__art"
              fill
              sizes="(max-width: 640px) 90vw, 44vw"
              src={artworkSrc}
            />
          ) : (
            <span aria-hidden="true" className="game-threshold-focal__monogram">
              {monogram}
            </span>
          )}
        </figure>

        <div className="game-threshold-launch-copy">
          <div className="game-threshold-readiness" aria-label="Game readiness">
            <MoriStatus tone="success">Ready</MoriStatus>
            {inputLabel ? <span>{inputLabel}</span> : null}
          </div>
          <div className="game-threshold-panel__copy">
            <h1>{title}</h1>
            {description ? <p>{description}</p> : null}
          </div>
          {essentialInstructions.length > 0 ? (
            <section aria-labelledby="game-threshold-instructions" className="game-threshold-instructions">
              <h2 id="game-threshold-instructions">How to play</h2>
              <ol>
                {essentialInstructions.map((instruction, index) => (
                  <li key={instruction}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
              {additionalInstructions.length > 0 ? (
                <details>
                  <summary>More instructions</summary>
                  <ul>
                    {additionalInstructions.map((instruction) => (
                      <li key={instruction}>{instruction}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </section>
          ) : null}
          <div className="game-threshold-actions game-threshold-actions--launch">
            <MoriButton onClick={onStart}>{launchLabel}</MoriButton>
            <Link
              className="mori-foundation-button"
              data-mori-variant="secondary"
              href="/mini-games"
            >
              Return to Mini-Games
            </Link>
          </div>
        </div>
      </MoriArtifact>
    </MoriGameThreshold>
  );
}

