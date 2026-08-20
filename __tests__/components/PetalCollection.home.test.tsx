import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PetalCollectionProvider,
  usePetalCollectionContext,
} from '@/app/contexts/PetalCollectionContext';
import { COLLECTION } from '@/app/lib/petals/constants';

vi.mock('@/app/lib/analytics/petals', () => ({
  trackPetalCollection: vi.fn(),
  trackPetalMilestone: vi.fn(),
}));

function CollectionHarness() {
  const collection = usePetalCollectionContext();

  return (
    <div>
      <button type="button" onClick={() => collection.collectPetal(Date.now(), 1, 0.12, 0.24)}>
        collect
      </button>
      <output data-testid="session-total">{collection.sessionTotal}</output>
      <output data-testid="remaining">{collection.guestDailyRemaining}</output>
      <output data-testid="capped">{collection.guestDailyCapReached ? 'yes' : 'no'}</output>
    </div>
  );
}

describe('home petal collection contract', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('caps guest home petal collection at 50 before optimistic UI exceeds the daily limit', () => {
    render(
      <PetalCollectionProvider>
        <CollectionHarness />
      </PetalCollectionProvider>,
    );

    const collectButton = screen.getByRole('button', { name: 'collect' });

    act(() => {
      for (let index = 0; index < COLLECTION.GUEST_DAILY_LIMIT + 5; index += 1) {
        fireEvent.click(collectButton);
      }
    });

    expect(screen.getByTestId('session-total')).toHaveTextContent(
      String(COLLECTION.GUEST_DAILY_LIMIT),
    );
    expect(screen.getByTestId('remaining')).toHaveTextContent('0');
    expect(screen.getByTestId('capped')).toHaveTextContent('yes');
  });
});
