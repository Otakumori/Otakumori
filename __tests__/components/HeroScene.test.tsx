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

describe('homepage hero scene client island', () => {
  afterEach(() => {
    cleanup();
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

    const { default: HeroScene } = await import('@/app/components/hero/HeroScene');
    render(<HeroScene />);

    const scene = await screen.findByTestId('mori-hero-scene');
    await waitFor(() => expect(scene).toHaveAttribute('data-scene-bucket', 'specialTwilight'));

    const images = screen.getAllByRole('img', { name: /Otakumori sakura tree scene/i });
    expect(images).toHaveLength(1);
    expect(images[0]).toHaveAttribute('src', '/assets/home/world/mori-world-twilight.png');
  });

  it('keeps reduced-motion petal density bounded', async () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(12);
    vi.spyOn(Date.prototype, 'getDate').mockReturnValue(2);
    stubMatchMedia(true);

    const { default: HeroScene } = await import('@/app/components/hero/HeroScene');
    render(<HeroScene />);

    const scene = await screen.findByTestId('mori-hero-scene');
    await waitFor(() => expect(scene).toHaveAttribute('data-scene-bucket', 'afternoon'));

    expect(screen.getAllByTestId('mori-petal')).toHaveLength(4);
  });
});
