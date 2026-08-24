import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HomeSceneProvider } from '@/app/components/hero/HomeSceneContext';
import { HOME_SCENE_MANIFEST } from '@/app/components/hero/homeScene';
import FallingPetals from '@/app/components/petals/FallingPetals';

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      matches,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

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

describe('homepage collectible petals', () => {
  beforeEach(() => {
    stubMatchMedia(false);
    vi.stubGlobal('IntersectionObserver', ImmediateIntersectionObserver);
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('uses semantic controls from the same sprite family and collects through the existing callback', () => {
    const onCollect = vi.fn();

    render(
      <HomeSceneProvider>
        <FallingPetals onPetalCollect={onCollect} />
      </HomeSceneProvider>,
    );

    const petals = screen.getAllByRole('button', { name: /collect sakura petal worth/i });
    expect(petals.length).toBeGreaterThan(0);
    expect(petals[0]).toHaveAttribute('data-collectible-hit-target', '44');
    expect(petals[0].querySelector('span')?.getAttribute('style')).toContain(
      HOME_SCENE_MANIFEST.petals.src,
    );
    expect(petals[0]).toHaveAttribute('data-petal-variant');

    petals[0].focus();
    fireEvent.click(petals[0]);

    expect(onCollect).toHaveBeenCalledTimes(1);
    expect(onCollect.mock.calls[0][1]).toBeGreaterThan(0);
  });

  it('keeps stable collectible controls available under reduced motion', async () => {
    stubMatchMedia(true);

    render(
      <HomeSceneProvider>
        <FallingPetals onPetalCollect={vi.fn()} />
      </HomeSceneProvider>,
    );

    const layer = screen.getByTestId('collectible-petal-layer');
    await waitFor(() => expect(layer).toHaveAttribute('data-reduced-motion', 'true'));
    expect(screen.getAllByRole('button', { name: /collect sakura petal worth/i }).length).toBe(4);
  });

  it('collects through native keyboard activation', async () => {
    const onCollect = vi.fn();
    const user = userEvent.setup();

    render(
      <HomeSceneProvider>
        <FallingPetals onPetalCollect={onCollect} />
      </HomeSceneProvider>,
    );

    const petal = screen.getAllByRole('button', { name: /collect sakura petal worth/i })[0];
    petal.focus();
    await act(async () => {
      await user.keyboard('{Enter}');
    });

    expect(onCollect).toHaveBeenCalledTimes(1);
  });

  it('announces a one-time non-modal hint and dismisses it from local UI storage', async () => {
    vi.useFakeTimers();

    render(
      <HomeSceneProvider>
        <FallingPetals onPetalCollect={vi.fn()} />
      </HomeSceneProvider>,
    );

    expect(screen.queryByTestId('petal-discovery-hint')).not.toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByTestId('petal-discovery-hint')).toHaveTextContent(
      'A petal stirred. Try catching one.',
    );

    fireEvent.click(screen.getByRole('button', { name: /dismiss petal hint/i }));

    expect(screen.queryByTestId('petal-discovery-hint')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('otm:home:petalHint:v1')).toBe('dismissed');
  });

  it('dismisses the discovery hint after the first collection without adding another economy path', async () => {
    vi.useFakeTimers();
    const onCollect = vi.fn();

    render(
      <HomeSceneProvider>
        <FallingPetals onPetalCollect={onCollect} />
      </HomeSceneProvider>,
    );

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    fireEvent.click(screen.getAllByRole('button', { name: /collect sakura petal worth/i })[0]);

    expect(onCollect).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('petal-discovery-hint')).not.toBeInTheDocument();
    expect(window.localStorage.getItem('otm:home:petalHint:v1')).toBe('dismissed');
  });

  it('does not intercept clicks outside the petal controls', () => {
    const onCollect = vi.fn();

    render(
      <HomeSceneProvider>
        <FallingPetals onPetalCollect={onCollect} />
      </HomeSceneProvider>,
    );

    fireEvent.click(screen.getByTestId('collectible-petal-layer'));
    expect(onCollect).not.toHaveBeenCalled();
  });

  it('stays paused when the tab becomes visible while the hero remains offscreen', () => {
    let observerCallback: IntersectionObserverCallback | undefined;

    class ControllableIntersectionObserver extends ImmediateIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        super(callback);
        observerCallback = callback;
      }
    }

    vi.stubGlobal('IntersectionObserver', ControllableIntersectionObserver);
    const visibilityState = vi.spyOn(document, 'visibilityState', 'get');

    render(
      <HomeSceneProvider>
        <FallingPetals onPetalCollect={vi.fn()} />
      </HomeSceneProvider>,
    );

    const layer = screen.getByTestId('collectible-petal-layer');
    act(() => {
      observerCallback?.(
        [{ isIntersecting: false, target: layer } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });
    expect(layer).toHaveAttribute('data-active', 'false');

    visibilityState.mockReturnValue('hidden');
    fireEvent(document, new Event('visibilitychange'));
    visibilityState.mockReturnValue('visible');
    fireEvent(document, new Event('visibilitychange'));

    expect(layer).toHaveAttribute('data-active', 'false');
  });
});
