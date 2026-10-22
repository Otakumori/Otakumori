import { act, cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/app/contexts/PetalCollectionContext', () => ({
  PetalCollectionProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('@/app/components/petals/PetalSystem', () => ({
  default: () => <div data-testid="petal-system-stub" />,
}));

vi.mock('@/app/components/hero/HeroOverlay', () => ({
  default: () => <div data-testid="hero-overlay-stub" />,
}));

vi.mock('@/app/components/hero/HeroScene', () => ({
  default: () => <div data-testid="mori-hero-scene" />,
}));

vi.mock('@/app/components/hero/RootFooter', () => ({
  default: () => (
    <footer data-root-footer-contract="combined-world-overlay" data-testid="mori-root-footer" />
  ),
}));

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

class NoopResizeObserver {
  observe() {}
  disconnect() {}
  unobserve() {}
}

describe('homepage scene shell contract', () => {
  beforeEach(() => {
    stubMatchMedia(false);
    vi.stubGlobal('ResizeObserver', NoopResizeObserver);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('resolves the browser-local scene without exposing the server fallback as authority', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 2, 3, 15, 0));
    const { default: HomeSceneShell } = await import('@/app/components/hero/HomeSceneShell');

    render(
      <HomeSceneShell>
        <h1 id="home-hero-title">You found Otaku-mori.</h1>
      </HomeSceneShell>,
    );

    const shell = screen.getByTestId('mori-home-scene-shell');
    expect(shell).toHaveAttribute('data-scene-ready', 'true');
    expect(shell).toHaveAttribute('data-scene-bucket', 'night');
  });

  it('refreshes scene authority at a real local-time boundary without a page reload', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 2, 19, 59, 59, 900));
    const { default: HomeSceneShell } = await import('@/app/components/hero/HomeSceneShell');

    render(
      <HomeSceneShell>
        <h1 id="home-hero-title">You found Otaku-mori.</h1>
      </HomeSceneShell>,
    );

    const shell = screen.getByTestId('mori-home-scene-shell');
    expect(shell).toHaveAttribute('data-scene-bucket', 'lateAfternoon');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    expect(shell).toHaveAttribute('data-scene-bucket', 'night');
  });

  it('resynchronizes stale scene authority when a sleeping tab becomes visible', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 2, 19, 30, 0));
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
    const { default: HomeSceneShell } = await import('@/app/components/hero/HomeSceneShell');

    render(
      <HomeSceneShell>
        <h1 id="home-hero-title">You found Otaku-mori.</h1>
      </HomeSceneShell>,
    );

    const shell = screen.getByTestId('mori-home-scene-shell');
    expect(shell).toHaveAttribute('data-scene-bucket', 'lateAfternoon');

    vi.setSystemTime(new Date(2026, 0, 2, 21, 30, 0));
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(shell).toHaveAttribute('data-scene-bucket', 'night');
  });

  it('exposes a stable browser-facing projection contract marker', async () => {
    const { default: HomeSceneShell } = await import('@/app/components/hero/HomeSceneShell');

    render(
      <HomeSceneShell>
        <h1 id="home-hero-title">You found Otaku-mori.</h1>
      </HomeSceneShell>,
    );

    const shell = screen.getByTestId('mori-home-scene-shell');

    expect(shell).toHaveAttribute('data-home-scene-shell');
    expect(shell).toHaveAttribute('data-scene-projection-contract', 'combined-world-master');
    expect(shell).toHaveAttribute('data-scene-surface-family', 'pending');
    expect(screen.getByTestId('mori-scene-surface')).toBeInTheDocument();
    expect(screen.getByTestId('mori-root-footer')).toHaveAttribute(
      'data-root-footer-contract',
      'combined-world-overlay',
    );
  });
});
