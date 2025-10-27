import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InteractivePetals from '@/components/hero/InteractivePetals';

// Mock the telemetry service
jest.mock('@/lib/telemetry', () => ({
  telemetry: {
    trackPetalCollect: jest.fn(),
  },
}));

// Mock the CANOPY_POINTS
jest.mock('@/app/components/tree/CherryTree', () => ({
  CANOPY_POINTS: [
    { x: 0.2, y: 0.1 },
    { x: 0.4, y: 0.15 },
    { x: 0.6, y: 0.12 },
    { x: 0.8, y: 0.18 },
  ],
}));

// Mock matchMedia for reduced motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('InteractivePetals', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<InteractivePetals variant="hero" />);
    expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();
  });

  it('should respect reduced motion preference', () => {
    // Mock reduced motion
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    render(<InteractivePetals variant="hero" />);

    // Should not render any petals when reduced motion is enabled
    expect(screen.queryByRole('button', { hidden: true })).not.toBeInTheDocument();
  });

  it('should generate petals with proper attributes', async () => {
    render(<InteractivePetals variant="hero" maxPetals={3} />);

    // Wait for petals to be generated
    await waitFor(() => {
      const petals = screen.getAllByRole('button', { hidden: true });
      expect(petals.length).toBeGreaterThan(0);
    });

    const petals = screen.getAllByRole('button', { hidden: true });

    // Check that petals have proper attributes
    petals.forEach((petal) => {
      expect(petal).toHaveAttribute('data-petal-id');
      expect(petal).toHaveAttribute('aria-label', 'Collectible petal');
      expect(petal).toHaveAttribute('tabIndex', '0');
    });
  });

  it('should handle petal click and track telemetry', async () => {
    const { telemetry } = require('@/lib/telemetry');

    render(<InteractivePetals variant="hero" maxPetals={1} />);

    // Wait for petal to be generated
    await waitFor(() => {
      const petals = screen.getAllByRole('button', { hidden: true });
      expect(petals.length).toBeGreaterThan(0);
    });

    const petal = screen.getAllByRole('button', { hidden: true })[0];

    // Mock document.elementFromPoint to return the petal element
    const mockElementFromPoint = jest.fn().mockReturnValue(petal);
    Object.defineProperty(document, 'elementFromPoint', {
      value: mockElementFromPoint,
      writable: true,
    });

    // Click the petal
    fireEvent.click(petal);

    // Wait for the petal to be collected (opacity should become 0)
    await waitFor(() => {
      expect(petal).toHaveStyle('opacity: 0');
    });

    // Verify telemetry was called
    expect(telemetry.trackPetalCollect).toHaveBeenCalledWith(
      'hero',
      expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
      }),
    );
  });

  it('should not collect petal if click is not on the petal element', async () => {
    const { telemetry } = require('@/lib/telemetry');

    render(<InteractivePetals variant="hero" maxPetals={1} />);

    // Wait for petal to be generated
    await waitFor(() => {
      const petals = screen.getAllByRole('button', { hidden: true });
      expect(petals.length).toBeGreaterThan(0);
    });

    const petal = screen.getAllByRole('button', { hidden: true })[0];

    // Mock document.elementFromPoint to return a different element
    const mockElementFromPoint = jest.fn().mockReturnValue(document.body);
    Object.defineProperty(document, 'elementFromPoint', {
      value: mockElementFromPoint,
      writable: true,
    });

    // Click the petal
    fireEvent.click(petal);

    // Petal should not be collected
    expect(petal).not.toHaveStyle('opacity: 0');

    // Telemetry should not be called
    expect(telemetry.trackPetalCollect).not.toHaveBeenCalled();
  });

  it('should handle keyboard events', async () => {
    const { telemetry } = require('@/lib/telemetry');

    render(<InteractivePetals variant="hero" maxPetals={1} />);

    // Wait for petal to be generated
    await waitFor(() => {
      const petals = screen.getAllByRole('button', { hidden: true });
      expect(petals.length).toBeGreaterThan(0);
    });

    const petal = screen.getAllByRole('button', { hidden: true })[0];

    // Mock document.elementFromPoint to return the petal element
    const mockElementFromPoint = jest.fn().mockReturnValue(petal);
    Object.defineProperty(document, 'elementFromPoint', {
      value: mockElementFromPoint,
      writable: true,
    });

    // Press Enter key
    fireEvent.keyDown(petal, { key: 'Enter' });

    // Wait for the petal to be collected
    await waitFor(() => {
      expect(petal).toHaveStyle('opacity: 0');
    });

    // Verify telemetry was called
    expect(telemetry.trackPetalCollect).toHaveBeenCalled();
  });

  it('should not collect petal on other key presses', async () => {
    const { telemetry } = require('@/lib/telemetry');

    render(<InteractivePetals variant="hero" maxPetals={1} />);

    // Wait for petal to be generated
    await waitFor(() => {
      const petals = screen.getAllByRole('button', { hidden: true });
      expect(petals.length).toBeGreaterThan(0);
    });

    const petal = screen.getAllByRole('button', { hidden: true })[0];

    // Press Escape key
    fireEvent.keyDown(petal, { key: 'Escape' });

    // Petal should not be collected
    expect(petal).not.toHaveStyle('opacity: 0');

    // Telemetry should not be called
    expect(telemetry.trackPetalCollect).not.toHaveBeenCalled();
  });

  it('should respect maxPetals limit', async () => {
    render(<InteractivePetals variant="hero" maxPetals={2} />);

    // Wait for petals to be generated
    await waitFor(() => {
      const petals = screen.getAllByRole('button', { hidden: true });
      expect(petals.length).toBeLessThanOrEqual(2);
    });

    const petals = screen.getAllByRole('button', { hidden: true });
    expect(petals.length).toBeLessThanOrEqual(2);
  });

  it('should use different variants correctly', () => {
    const { rerender } = render(<InteractivePetals variant="hero" />);

    // Check that hero variant renders
    expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();

    // Rerender with spacer variant
    rerender(<InteractivePetals variant="spacer" />);

    // Should still render
    expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();
  });
});
