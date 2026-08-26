import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeSceneProvider } from '@/app/components/hero/HomeSceneContext';
import PetalSystem from '@/app/components/petals/PetalSystem';
import {
  PetalCollectionProvider,
  usePetalCollectionContext,
} from '@/app/contexts/PetalCollectionContext';
import { COLLECTION } from '@/app/lib/petals/constants';

vi.mock('@/app/lib/analytics/petals', () => ({
  trackPetalCollection: vi.fn(),
  trackPetalMilestone: vi.fn(),
}));

vi.mock('@clerk/nextjs', () => ({
  useAuth: () => ({ isSignedIn: false }),
}));

class ImmediateIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element) {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as never);
  }

  disconnect() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  root = null;
  rootMargin = '0px';
  thresholds = [0];
}

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
    vi.stubGlobal('IntersectionObserver', ImmediateIntersectionObserver);
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '',
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
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

  it('surfaces collected value through the existing petal counter', () => {
    render(
      <HomeSceneProvider>
        <PetalCollectionProvider>
          <PetalSystem />
        </PetalCollectionProvider>
      </HomeSceneProvider>,
    );

    const petal = screen.getAllByRole('button', { name: /collect sakura petal worth/i })[0];
    const collectedValue = petal.getAttribute('aria-label')?.match(/worth (\d+)/)?.[1];

    fireEvent.click(petal);

    expect(
      screen.getByRole('button', { name: `Petals collected: ${collectedValue}` }),
    ).toBeInTheDocument();
    expect(localStorage.getItem('otm-has-collected-petal')).toBe('true');
  });
});
