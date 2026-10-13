'use client';

import { type ReactNode } from 'react';

import { MoriGameThreshold } from '@/app/components/mori/MoriGameSystem';
import { MoriButton, MoriStatus } from '@/app/components/mori/MoriFoundation';
import { MoriArtifact } from '@/app/components/mori/MoriProduction';

interface GameResultsScreenProps {
  title: string;
  score: number;
  isWin: boolean;
  stats?: Array<{ label: string; value: string | number }>;
  onRestart: () => void;
  onBack: () => void;
  children?: ReactNode;
}

/**
 * Game Results Screen Component
 * Displays final score, win/loss state, and stats using design system variables
 */
export function GameResultsScreen({
  title,
  score,
  isWin,
  stats = [],
  onRestart,
  onBack,
  children,
}: GameResultsScreenProps) {
  return (
    <MoriGameThreshold className="game-threshold-screen" label={`${title} results threshold`}>
      <MoriArtifact className="game-threshold-panel game-threshold-panel--results" family="game">
        <MoriStatus tone={isWin ? 'success' : 'neutral'}>
          {isWin ? 'Run complete' : 'Run ended'}
        </MoriStatus>
        <div className="game-threshold-panel__copy">
          <h2>{isWin ? 'Victory' : 'Game over'}</h2>
          <p>{title}</p>
        </div>
        <dl className="game-threshold-results">
          <div className="game-threshold-results__score">
            <dt>Final score</dt>
            <dd>{score.toLocaleString()}</dd>
          </div>
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
        {children}
        <div className="game-threshold-actions">
          <MoriButton onClick={onRestart}>Play again</MoriButton>
          <MoriButton onClick={onBack} variant="secondary">
            Return to games
          </MoriButton>
        </div>
      </MoriArtifact>
    </MoriGameThreshold>
  );
}

