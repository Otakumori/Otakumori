import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { MoriSurface } from '@/app/components/mori/MoriFoundation';
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

describe('Mori production system', () => {
  it('locks the owner-authoritative Sakura, bronze, geometry, and response tokens', () => {
    const css = readFileSync(join(process.cwd(), 'app/styles/mori-foundation.css'), 'utf8');

    expect(css).toContain('--mori-color-sakura-500: #ab6366;');
    expect(css).toContain('--mori-color-bronze-500: #896f48;');
    expect(css).toContain('--mori-radius-object: 9px;');
    expect(css).toContain('--mori-duration-respond: 180ms;');
    expect(css).toContain('--mori-surface-grain-opacity: 0.12;');
  });

  it('extends material choice without implying containment', () => {
    const { container } = render(<MoriSurface material="glass">Retained memory</MoriSurface>);

    expect(container.firstChild).toHaveAttribute('data-mori-material', 'glass');
    expect(container.firstChild).toHaveAttribute('data-mori-containment', 'none');
  });

  it('exposes typed construction, archetype, and artifact routing hooks', () => {
    render(
      <MoriArchetype archetype="merchant" as="main">
        <MoriArtifact family="commerce">
          <MoriConstructedSurface construction="retained-glass">
            Product object
          </MoriConstructedSurface>
        </MoriArtifact>
      </MoriArchetype>,
    );

    expect(screen.getByRole('main')).toHaveAttribute('data-mori-archetype', 'merchant');
    expect(screen.getByText('Product object').parentElement).toHaveAttribute(
      'data-mori-artifact-family',
      'commerce',
    );
    expect(screen.getByText('Product object')).toHaveAttribute(
      'data-mori-construction',
      'retained-glass',
    );
  });

  it.each<MoriSystemStateKind>([
    'loading',
    'locked',
    'unavailable',
    'success',
    'warning',
    'error',
    'empty',
  ])('renders the %s state with an accessible announcement', (state) => {
    render(<MoriSystemState description="State details" state={state} title={`${state} title`} />);

    const expectedRole = state === 'warning' || state === 'error' ? 'alert' : 'status';
    const region = screen.getByRole(expectedRole);
    expect(region).toHaveAttribute('data-mori-system-state', state);
    expect(screen.getByRole('heading', { name: `${state} title` })).toBeVisible();
    if (state === 'loading') {
      expect(region).toHaveAttribute('aria-busy', 'true');
    } else {
      expect(region).not.toHaveAttribute('aria-busy');
    }
  });

  it('keeps game HUD values semantic and progress bounded', () => {
    render(
      <MoriGameThreshold label="Memory gate">
        <MoriGameHud metrics={[{ label: 'Score', value: 1200 }]} progress={1.4} />
      </MoriGameThreshold>,
    );

    expect(screen.getByRole('region', { name: 'Memory gate' })).toHaveAttribute(
      'data-mori-archetype',
      'game-threshold',
    );
    expect(screen.getByRole('complementary', { name: 'Game status' })).toHaveAttribute(
      'data-mori-artifact-family',
      'game',
    );
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '1');
  });

  it('keeps game overlay actions native and keyboard operable', async () => {
    const user = userEvent.setup();
    const onPrimary = vi.fn();

    render(
      <MoriGameOverlay onPrimary={onPrimary} primaryLabel="Resume" state="pause" title="Paused" />,
    );

    expect(screen.getByRole('dialog', { name: 'Paused' })).toHaveAttribute('aria-modal', 'true');
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(onPrimary).toHaveBeenCalledOnce();
  });
});
