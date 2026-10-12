import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ErrorBoundary from '@/app/error';
import OneTapGamertag from '@/app/components/profile/OneTapGamertag';
import { RitualStatePage } from '@/app/components/system/RitualStatePage';

vi.mock('@/app/actions/renameGamertag', () => ({
  renameGamertag: vi.fn(),
}));

vi.mock('@/app/lib/logger', () => ({
  logger: { error: vi.fn() },
}));

describe('Ritual system recovery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('uses one semantic state wrapper for a consequential boundary', () => {
    render(
      <RitualStatePage
        description="This section is protected."
        state="locked"
        title="Access required"
      />,
    );

    expect(screen.getByRole('main')).toHaveAttribute('data-mori-archetype', 'ritual');
    expect(screen.getByRole('status')).toHaveAttribute('data-mori-system-state', 'locked');
    expect(screen.getByRole('heading', { level: 1, name: 'Access required' })).toBeVisible();
  });

  it('does not expose raw exception text in the route recovery surface', () => {
    render(
      <ErrorBoundary
        error={new Error('DATABASE_URL rejected with private transport detail')}
        reset={vi.fn()}
      />,
    );

    expect(screen.getByRole('alert')).toHaveAttribute('data-mori-system-state', 'error');
    expect(screen.queryByText(/DATABASE_URL/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  it('uses an accessible modal confirmation for the annual public-name change', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ suggestions: ['MoonArchive', 'QuietMori'] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    render(<OneTapGamertag initial="OldName" />);

    fireEvent.click(screen.getByRole('button', { name: 'Forge names' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'MoonArchive' })).toBeVisible());
    fireEvent.click(screen.getByRole('button', { name: 'MoonArchive' }));
    fireEvent.click(screen.getByRole('button', { name: 'Use selected name' }));

    const dialog = await screen.findByRole('dialog', { name: 'Confirm public name' });
    expect(dialog).toHaveAttribute('aria-describedby');
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Confirm name' })).toBeVisible();
  });
});
