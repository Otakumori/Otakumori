import { render, screen } from '@testing-library/react';
import { useAuth } from '@clerk/nextjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import PetalCounter from '@/app/components/petals/PetalCounter';

describe('PetalCounter visual QA provider boundary', () => {
  afterEach(() => {
    document.body.removeAttribute('data-visual-qa-auth');
    vi.clearAllMocks();
  });

  it('does not call Clerk auth hooks under the explicit local visual QA shell', () => {
    document.body.setAttribute('data-visual-qa-auth', 'true');
    vi.mocked(useAuth).mockImplementation(() => {
      throw new Error('Clerk useAuth should not run in visual QA petal counter mode');
    });

    render(<PetalCounter count={3} guestDailyRemaining={47} />);

    expect(screen.getByRole('button', { name: /petals collected: 3/i })).toBeInTheDocument();
    expect(useAuth).not.toHaveBeenCalled();
  });
});
