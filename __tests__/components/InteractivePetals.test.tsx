import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import InteractivePetals from '@/components/hero/InteractivePetals';

const matchMediaMock = vi.fn();
const requestAnimationFrameMock = vi.fn(() => 1);
const cancelAnimationFrameMock = vi.fn();

vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(() => ({ isSignedIn: false })),
}));

describe('InteractivePetals canvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    matchMediaMock.mockReturnValue({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: matchMediaMock,
    });
    Object.defineProperty(window, 'requestAnimationFrame', {
      configurable: true,
      value: requestAnimationFrameMock,
    });
    Object.defineProperty(window, 'cancelAnimationFrame', {
      configurable: true,
      value: cancelAnimationFrameMock,
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
  });

  it('renders the current canvas surface and collection counter', () => {
    const { container } = render(<InteractivePetals className="test-surface" />);

    expect(container.querySelector('canvas')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('test-surface');
    expect(screen.getByText('Collected Today')).toBeVisible();
    expect(screen.getByText('0 / 100')).toBeVisible();
  });

  it('renders nothing when reduced motion is requested', () => {
    matchMediaMock.mockReturnValue({
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

    expect(container).toBeEmptyDOMElement();
  });

  it('does not call external services when an empty canvas is clicked', () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch');
    const { container } = render(<InteractivePetals maxPetals={1} />);
    const canvas = container.querySelector('canvas');

    expect(canvas).not.toBeNull();
    fireEvent.click(canvas!, { clientX: 10, clientY: 10 });

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts a bounded maxPetals value without changing the public surface', () => {
    const { container } = render(<InteractivePetals maxPetals={2} />);

    expect(container.querySelectorAll('canvas')).toHaveLength(1);
    expect(screen.getByText('0 / 100')).toBeVisible();
  });
});
