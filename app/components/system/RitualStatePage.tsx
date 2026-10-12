import type { ReactNode } from 'react';

import { MoriArchetype, MoriArtifact, MoriSystemState, type MoriSystemStateKind } from '@/app/components/mori/MoriProduction';

export function RitualStatePage({
  action,
  description,
  eyebrow = 'System state',
  state,
  title,
}: {
  action?: ReactNode;
  description: string;
  eyebrow?: string;
  state: MoriSystemStateKind;
  title: string;
}) {
  return (
    <MoriArchetype archetype="ritual" as="main" className="ritual-system-page">
      <header className="ritual-system-page__heading">
        <p className="mori-foundation-eyebrow">{eyebrow}</p>
      </header>
      <MoriArtifact family="system" className="ritual-system-page__state">
        <MoriSystemState
          action={action}
          description={description}
          headingLevel={1}
          state={state}
          title={title}
        />
      </MoriArtifact>
    </MoriArchetype>
  );
}
