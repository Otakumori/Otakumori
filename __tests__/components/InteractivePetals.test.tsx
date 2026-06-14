import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import InteractivePetals from '@/components/hero/InteractivePetals';

vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(() => ({ isSignedIn: false })),
}));

describe('InteractivePetals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  it('renders the interactive canvas', () => {
    const { container } = render(<InteractivePetals />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
  });

  it('hides the effect when reduced motion is enabled', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });

    const { container } = render(<InteractivePetals />);
    expect(container.querySelector('canvas')).not.toBeInTheDocument();
  });

  it('renders the daily collection counter', () => {
    render(<InteractivePetals />);
    expect(screen.getByText('Collected Today')).toBeInTheDocument();
    expect(screen.getByText('0 / 100')).toBeInTheDocument();
  });

  it('applies a custom class to the wrapper', () => {
    const { container } = render(<InteractivePetals className="test-petals" />);
    expect(container.firstChild).toHaveClass('test-petals');
  });

  it('keeps the canvas positioned over its container', () => {
    const { container } = render(<InteractivePetals />);
    expect(container.querySelector('canvas')).toHaveClass('absolute', 'inset-0', 'w-full', 'h-full');
  });

  it('disables browser touch gestures on the canvas', () => {
    const { container } = render(<InteractivePetals />);
    expect((container.querySelector('canvas') as HTMLCanvasElement).style.touchAction).toBe('none');
  });

  it('accepts a custom petal limit without changing the daily limit display', () => {
    render(<InteractivePetals maxPetals={2} />);
    expect(screen.getByText('0 / 100')).toBeInTheDocument();
  });

  it('does not render combo text before a collection', () => {
    render(<InteractivePetals />);
    expect(screen.queryByText(/COMBO!/)).not.toBeInTheDocument();
  });

  it('updates wrapper classes when rerendered', () => {
    const { container, rerender } = render(<InteractivePetals className="first" />);
    rerender(<InteractivePetals className="second" />);
    expect(container.firstChild).toHaveClass('second');
    expect(container.firstChild).not.toHaveClass('first');
  });
});
