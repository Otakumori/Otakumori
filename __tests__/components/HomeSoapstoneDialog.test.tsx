import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import HomeSoapstoneDialog from '@/app/components/home/HomeSoapstoneDialog';

describe('HomeSoapstoneDialog', () => {
  it('opens as an accessible in-world dialog with an owned route CTA', async () => {
    const user = userEvent.setup();

    render(<HomeSoapstoneDialog />);

    const trigger = screen.getByRole('button', { name: /read a soapstone/i });

    await act(async () => {
      await user.click(trigger);
    });

    const dialog = screen.getByRole('dialog', { name: /a message beneath the roots/i });
    expect(dialog).toHaveTextContent('Soapstones are little traces left for other travelers.');
    const plaque = dialog.querySelector(
      'img[src*="soapstone-plaque-embedded"]',
    ) as HTMLImageElement | null;
    expect(plaque).not.toBeNull();
    expect(plaque).toHaveAttribute('alt', '');
    expect(plaque).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('link', { name: /visit soapstones/i })).toHaveAttribute(
      'href',
      '/community/soapstones',
    );
    expect(screen.getByRole('button', { name: /leave it be/i })).toHaveFocus();

    await act(async () => {
      await user.tab();
    });
    expect(screen.getByRole('link', { name: /visit soapstones/i })).toHaveFocus();

    await act(async () => {
      await user.tab({ shift: true });
    });
    expect(screen.getByRole('button', { name: /leave it be/i })).toHaveFocus();

    await act(async () => {
      await user.keyboard('{Escape}');
    });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });
});
