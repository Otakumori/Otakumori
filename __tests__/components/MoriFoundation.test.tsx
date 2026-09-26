import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  MoriButton,
  MoriDivider,
  MoriSectionHeader,
  MoriStatus,
  MoriSurface,
} from '@/app/components/mori/MoriFoundation';

describe('Mori foundation primitives', () => {
  it('keeps material and heading intent in semantic markup', () => {
    render(
      <MoriSurface aria-label="Archive record" material="parchment">
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
    expect(screen.getByRole('heading', { level: 2, name: 'Mori foundation' })).toBeVisible();
    expect(screen.getByText('Recorded information remains legible.')).toBeVisible();
  });

  it('exposes real button, status, and optional divider labels', () => {
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
    expect(screen.getByText('Continuity')).toBeVisible();
  });

  it('preserves disabled semantics without removing the accessible name', () => {
    render(<MoriButton disabled>Unavailable record</MoriButton>);

    expect(screen.getByRole('button', { name: 'Unavailable record' })).toBeDisabled();
  });
});
