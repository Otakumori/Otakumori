import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CommanderArchiveShell } from '@/app/components/commander/CommanderArchive';

describe('CommanderArchiveShell', () => {
  it('keeps one centered archive landmark with persistent semantic navigation', () => {
    const { container } = render(
      <CommanderArchiveShell current="orders">
        <h1>Orders</h1>
      </CommanderArchiveShell>,
    );

    expect(container.querySelector('main[data-mori-archetype="commander"]')).not.toBeNull();
    expect(screen.getByRole('navigation', { name: 'Commander archive' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: 'Orders' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Achievements' })).toHaveAttribute(
      'href',
      '/profile/achievements',
    );
  });
});
