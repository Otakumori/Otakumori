'use client';

import { useState } from 'react';

import { MoriArchetype, MoriArtifact, MoriSystemState, type MoriSystemStateKind } from '@/app/components/mori/MoriProduction';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/Dialog';

const states: MoriSystemStateKind[] = [
  'loading',
  'locked',
  'unavailable',
  'success',
  'warning',
  'error',
  'empty',
];

export function RitualSystemFixture() {
  const [state, setState] = useState<MoriSystemStateKind>('success');

  return (
    <MoriArchetype archetype="ritual" as="main" className="ritual-system-settings">
      <header className="ritual-system-settings__hero">
        <p className="mori-foundation-eyebrow">Visual QA fixture</p>
        <h1>Settings</h1>
        <p>Review account controls, consequential actions, and system feedback in one safe fixture.</p>
      </header>
      <div className="ritual-system-settings__layout">
        <nav aria-label="Settings sections" className="ritual-system-settings__index">
          <p className="ritual-system-settings__index-label">System index</p>
          <a aria-current="page" href="#fixture-preferences">Preferences</a>
          <a href="#fixture-state">System state</a>
        </nav>
        <div className="ritual-system-fixture__flow">
          <MoriArtifact
            aria-labelledby="fixture-preferences-title"
            as="section"
            family="system"
            className="ritual-system-settings__content"
            id="fixture-preferences"
          >
            <header className="ritual-system-settings__section-heading">
              <p className="mori-foundation-eyebrow">Controlled preferences</p>
              <h2 id="fixture-preferences-title">Account signals</h2>
              <p>Labels, consequences, and current values stay close to each control.</p>
            </header>
            <div className="ritual-system-fixture__rows">
              <label>
                <span>
                  <strong>Archive notices</strong>
                  <small>Receive account and order notices.</small>
                </span>
                <input aria-label="Archive notices" defaultChecked type="checkbox" />
              </label>
              <label>
                <span>
                  <strong>Interface volume</strong>
                  <small>Adjust non-critical interface sounds.</small>
                </span>
                <input aria-label="Interface volume" defaultValue="60" max="100" min="0" type="range" />
              </label>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button className="mori-button-danger" type="button">Review destructive action</button>
              </DialogTrigger>
              <DialogContent className="ritual-system-dialog">
                <DialogHeader>
                  <DialogTitle>Remove local draft?</DialogTitle>
                  <DialogDescription>
                    This visual-QA action demonstrates an irreversible confirmation. It does not alter account or provider data.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <button className="mori-button-secondary" type="button">Cancel</button>
                  <button className="mori-button-danger" type="button">Remove draft</button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </MoriArtifact>

          <MoriArtifact as="section" family="system" className="ritual-system-settings__content" id="fixture-state">
            <header className="ritual-system-settings__section-heading">
              <p className="mori-foundation-eyebrow">Semantic state</p>
              <h2>System response</h2>
            </header>
            <div aria-label="Choose a system state" className="ritual-system-fixture__state-picker">
              {states.map((item) => (
                <button
                  aria-pressed={state === item}
                  className="mori-button-secondary"
                  data-mori-selected={state === item || undefined}
                  key={item}
                  onClick={() => setState(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
            <MoriSystemState
              description="The semantic state, announcement, and recovery region remain stable across viewports."
              state={state}
              title={`${state[0]?.toUpperCase()}${state.slice(1)} state`}
            />
          </MoriArtifact>
        </div>
      </div>
    </MoriArchetype>
  );
}
