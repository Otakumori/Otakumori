import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ alt = '', fill: _fill, priority: _priority, quality: _quality, ...props }: any) => (
    <img alt={alt} {...props} />
  ),
}));

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

async function renderHeroScene() {
  const [{ default: HeroScene }, { HomeSceneProvider }] = await Promise.all([
    import('@/app/components/hero/HeroScene'),
    import('@/app/components/hero/HomeSceneContext'),
  ]);

  return render(
    <HomeSceneProvider>
      <HeroScene />
    </HomeSceneProvider>,
  );
}

describe('homepage hero scene client island', () => {
  afterEach(() => {
    cleanup();
    document.head.querySelectorAll('link[rel="preload"]').forEach((node) => {
      node.remove();
    });
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('can be imported without network or provider side effects', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    await import('@/app/components/hero/HeroScene');

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('renders one optimized active hero image and the local-time scene state', async () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(20);
    vi.spyOn(Date.prototype, 'getDate').mockReturnValue(1);
    stubMatchMedia(false);

    await renderHeroScene();

    const scene = await screen.findByTestId('mori-hero-scene');
    await waitFor(() => expect(scene).toHaveAttribute('data-scene-bucket', 'specialTwilight'));
    expect(screen.getByTestId('mori-world-extension')).toBeInTheDocument();
    expect(screen.getByTestId('mori-scene-plate')).toBeInTheDocument();

    const images = screen.getAllByRole('img', { name: /Otakumori sakura shoreline/i });
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute(
      'src',
      '/assets/home/world/combined/om-home-world-06-special-twilight-wide.png',
    );
    expect(images[0].className).toContain('image');
    await waitFor(() => {
      const preloadHrefs = Array.from(
        document.head.querySelectorAll<HTMLLinkElement>('link[rel="preload"]'),
      ).map((link) => link.href);

      expect(
        preloadHrefs.some((href) =>
          href.endsWith('/assets/home/world/combined/om-home-world-06-special-twilight-wide.png'),
        ),
      ).toBe(true);
      expect(
        preloadHrefs.some((href) =>
          href.endsWith('/assets/home/world/combined/om-home-world-05-night-wide.png'),
        ),
      ).toBe(true);
    });
  });

  it('keeps reduced-motion petal density bounded', async () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(12);
    vi.spyOn(Date.prototype, 'getDate').mockReturnValue(2);
    stubMatchMedia(true);

    await renderHeroScene();

    const scene = await screen.findByTestId('mori-hero-scene');
    await waitFor(() => expect(scene).toHaveAttribute('data-scene-bucket', 'afternoon'));

    expect(screen.getAllByTestId('mori-petal')).toHaveLength(4);
  });

  it('renders decorative petals from the sprite atlas instead of text glyphs', async () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(12);
    vi.spyOn(Date.prototype, 'getDate').mockReturnValue(2);
    stubMatchMedia(false);

    await renderHeroScene();

    const petalEmitter = await screen.findByTestId('mori-petal-emitter');
    expect(petalEmitter).toHaveAttribute('aria-hidden', 'true');

    const petals = screen.getAllByTestId('mori-petal');
    expect(petals.length).toBeGreaterThan(0);
    petals.forEach((petal) => {
      expect(petal.textContent).toBe('');
      expect(window.getComputedStyle(petal).backgroundImage).toContain(
        '/assets/images/petal_sprite.png',
      );
      expect(petal).toHaveAttribute('data-petal-variant');
    });
  });
});
