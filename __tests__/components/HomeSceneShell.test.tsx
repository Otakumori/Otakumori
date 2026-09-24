import { cleanup, render, screen } from '@testing-library/react';
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
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
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
