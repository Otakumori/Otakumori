import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  MoriButton,
  MoriDivider,
  MoriFrame,
  MoriSectionHeader,
  MoriStatus,
  MoriSurface,
} from '@/app/components/mori/MoriFoundation';

describe('Mori foundation primitives', () => {
  it('keeps material, containment, and heading intent in semantic markup', () => {
    render(
      <MoriSurface as="section" aria-label="Archive record" containment="quiet" material="parchment">
        <MoriSectionHeader
          description="Recorded information remains legible."
          eyebrow="Archive"
          headingLevel={2}
          title="Mori foundation"
        />
      </MoriSurface>,
    );

    expect(screen.getByRole('region', { name: 'Archive record' })).toHaveAttribute(
      'data-mori-material',
      'parchment',
    );
    expect(screen.getByRole('region', { name: 'Archive record' })).toHaveAttribute(
      'data-mori-containment',
      'quiet',
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Mori foundation' })).toBeVisible();
    expect(screen.getByText('Recorded information remains legible.')).toBeVisible();
  });

  it('leaves visual material wrappers semantically neutral by default', () => {
    const { container } = render(
      <MoriSurface material="paper" texture="grain">
        Quiet substrate
      </MoriSurface>,
    );

    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('data-mori-containment', 'none');
    expect(container.firstChild).toHaveAttribute('data-mori-texture', 'grain');
  });

  it('keeps relic framing explicit instead of adding it to every material surface', () => {
    render(<MoriFrame data-testid="relic-frame">Remembered object</MoriFrame>);

    expect(screen.getByTestId('relic-frame')).toHaveClass('mori-foundation-frame');
  });

  it('exposes real button, status, and intentional divider semantics', () => {
    render(
      <>
        <MoriButton variant="secondary">Open archive</MoriButton>
        <MoriStatus tone="selected">Remembered</MoriStatus>
        <MoriDivider label="Continuity" />
      </>,
    );

    expect(screen.getByRole('button', { name: 'Open archive' })).toHaveAttribute(
      'data-mori-variant',
      'secondary',
    );
    expect(screen.getByText('Remembered')).toHaveAttribute('data-mori-tone', 'selected');
    expect(screen.getByRole('separator', { name: 'Continuity' })).toBeVisible();
  });

  it('preserves disabled semantics without removing the accessible name', () => {
    render(<MoriButton disabled>Unavailable record</MoriButton>);

    expect(screen.getByRole('button', { name: 'Unavailable record' })).toBeDisabled();
  });
});
