'use client';

import { useState } from 'react';

import { MoriButton, MoriSurface } from '@/app/components/mori/MoriFoundation';
import {
  MoriGameHud,
  MoriGameOverlay,
  MoriGameThreshold,
} from '@/app/components/mori/MoriGameSystem';
import {
  MoriArchetype,
  MoriArtifact,
  MoriConstructedSurface,
  MoriSystemState,
  type MoriSystemStateKind,
} from '@/app/components/mori/MoriProduction';

const states: MoriSystemStateKind[] = [
  'loading',
  'locked',
  'unavailable',
  'success',
  'warning',
  'error',
  'empty',
];

const construction = [
  'raised',
  'inset',
  'channel',
  'lip',
  'recess',
  'overlay',
  'retained-glass',
  'seam',
  'hinge',
  'transition',
  'press',
] as const;

export function ProductionSystemLab() {
  const [systemState, setSystemState] = useState<MoriSystemStateKind>('loading');
  const [gameState, setGameState] = useState<'pause' | 'reward' | 'results' | null>(null);

  return (
    <div className="mori-production-lab">
      <section aria-labelledby="mori-construction-heading" className="mori-production-lab__section">
        <header>
          <p className="mori-foundation-eyebrow">Construction</p>
          <h2 className="mori-foundation-heading" id="mori-construction-heading">
            Physical logic without decorative hardware
          </h2>
        </header>
        <div className="mori-production-lab__construction-grid">
          {construction.map((kind) => (
            <MoriConstructedSurface
              construction={kind}
              key={kind}
              tabIndex={kind === 'press' ? 0 : undefined}
            >
              <span>{kind}</span>
            </MoriConstructedSurface>
          ))}
        </div>
      </section>

      <section aria-labelledby="mori-archetype-heading" className="mori-production-lab__section">
        <header>
          <p className="mori-foundation-eyebrow">Page archetypes</p>
          <h2 className="mori-foundation-heading" id="mori-archetype-heading">
            Five compositions, one material authority
          </h2>
        </header>
        <div className="mori-production-lab__archetypes">
          <MoriArchetype archetype="merchant">
            <MoriArtifact family="commerce">
              <p className="mori-foundation-eyebrow">Merchant</p>
              <h3>Object first. Price and utility remain immediate.</h3>
              <MoriConstructedSurface className="mori-production-lab__object" construction="lip" />
              <p>Archive object · $48.00</p>
            </MoriArtifact>
          </MoriArchetype>

          <MoriArchetype archetype="commander">
            <MoriArtifact family="commander">
              <p className="mori-foundation-eyebrow">Commander Archive</p>
              <h3>Identity and history remain centered.</h3>
              <p>Persistent navigation, quiet records, and preserved anchor art.</p>
            </MoriArtifact>
          </MoriArchetype>

          <MoriArchetype archetype="discovery">
            <p className="mori-foundation-eyebrow">Discovery</p>
            <h3>One large entry moment opens a spacious index.</h3>
            <label>
              <span>Search the archive</span>
              <input placeholder="What’re ya eyein’?" type="search" />
            </label>
          </MoriArchetype>

          <MoriArchetype archetype="ritual">
            <MoriArtifact family="system">
              <p className="mori-foundation-eyebrow">Ritual / System</p>
              <h3>Dense controls stay strictly grouped and legible.</h3>
              <label>
                <span>Interface volume</span>
                <input defaultValue="64" max="100" min="0" type="range" />
              </label>
            </MoriArtifact>
          </MoriArchetype>

          <MoriGameThreshold label="Game Threshold specimen">
            <div className="mori-production-lab__game-stage">
              <header>
                <p className="mori-foundation-eyebrow">Game Threshold</p>
                <h3>Enter the archive mechanism.</h3>
              </header>
              <MoriGameHud
                metrics={[
                  { label: 'Score', value: '12,480' },
                  { emphasis: 'selected', label: 'Chain', value: '6×' },
                  { emphasis: 'warning', label: 'Time', value: '00:42' },
                ]}
                progress={0.64}
                progressLabel="Memory restored"
              />
              <div className="mori-production-lab__actions">
                <MoriButton onClick={() => setGameState('pause')}>Pause</MoriButton>
                <MoriButton onClick={() => setGameState('reward')} variant="secondary">
                  Reward state
                </MoriButton>
                <MoriButton onClick={() => setGameState('results')} variant="secondary">
                  Results state
                </MoriButton>
              </div>
              {gameState ? (
                <MoriGameOverlay
                  description="State and actions remain clear while the world holds its depth."
                  onPrimary={() => setGameState(null)}
                  primaryLabel={gameState === 'pause' ? 'Resume' : 'Continue'}
                  secondaryLabel="Close"
                  onSecondary={() => setGameState(null)}
                  state={gameState}
                  title={
                    gameState === 'pause'
                      ? 'Paused'
                      : gameState === 'reward'
                        ? 'Reward secured'
                        : 'Run complete'
                  }
                />
              ) : null}
            </div>
          </MoriGameThreshold>
        </div>
      </section>

      <section aria-labelledby="mori-state-heading" className="mori-production-lab__section">
        <header>
          <p className="mori-foundation-eyebrow">System states</p>
          <h2 className="mori-foundation-heading" id="mori-state-heading">
            Seven states, one semantic wrapper
          </h2>
        </header>
        <div aria-label="Choose system state" className="mori-production-lab__state-picker">
          {states.map((state) => (
            <MoriButton
              aria-pressed={systemState === state}
              data-mori-selected={systemState === state || undefined}
              key={state}
              onClick={() => setSystemState(state)}
              variant="secondary"
            >
              {state}
            </MoriButton>
          ))}
        </div>
        <MoriSurface className="mori-production-lab__state" material="charcoal">
          <MoriSystemState
            action={<MoriButton variant="secondary">Available action</MoriButton>}
            description="Code owns the state, message, announcement, and recovery action."
            state={systemState}
            title={`${systemState[0].toUpperCase()}${systemState.slice(1)} state`}
          />
        </MoriSurface>
      </section>
    </div>
  );
}
