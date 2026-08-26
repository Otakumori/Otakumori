import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import HomeSoapstoneDialog from '@/app/components/home/HomeSoapstoneDialog';

describe('HomeSoapstoneDialog', () => {
  it('opens as an accessible in-world dialog with an owned route CTA', async () => {
    const user = userEvent.setup();

    render(<HomeSoapstoneDialog />);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /read a soapstone/i }));
    });

    const dialog = screen.getByRole('dialog', { name: /a message beneath the roots/i });
    expect(dialog).toHaveTextContent('Soapstones are little traces left for other travelers.');
    expect(screen.getByRole('link', { name: /visit soapstones/i })).toHaveAttribute(
      'href',
      '/community/soapstones',
    );

    await act(async () => {
      await user.keyboard('{Escape}');
    });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
