import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ImgHTMLAttributes } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ fill: _fill, ...props }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => <img {...props} />,
}));

import { InteractionLab } from '@/app/test/visual-system/InteractionLab';

describe('interaction-language lab', () => {
  it('keeps the prototype vocabulary and research zones inside the internal lab', () => {
    render(<InteractionLab />);

    expect(screen.getByRole('heading', { name: 'Six verbs, held with restraint.' })).toBeVisible();
    expect(screen.getByText('TRACE')).toBeVisible();
    expect(screen.getByText('CONFIRM')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Physics research zone' })).toBeVisible();
    expect(screen.getByText('LAB ONLY')).toBeVisible();
  });

  it('uses native controls to make reveal, selection, confirmation, and transition states observable', () => {
    const { container } = render(<InteractionLab />);

    act(() => fireEvent.click(screen.getAllByRole('button', { name: 'Preview reveal' })[0]));
    expect(screen.getAllByRole('button', { name: 'Reset reveal' })).toHaveLength(1);

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Relics' })));
    expect(screen.getByRole('button', { name: 'Relics' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Selected archive: Relics')).toHaveAttribute('role', 'status');

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Seal / stamp' })));
    expect(screen.getByText('seal confirmation previewed.')).toBeVisible();

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Relic aperture' })));
    expect(container.querySelector('.om-lab-transition-stage')).toHaveAttribute('data-transition', 'aperture');
  });

  it('keeps pigment and seal reveals as named, keyboard-operable lab proofs', () => {
    const { container } = render(<InteractionLab />);

    const pigment = screen.getByRole('button', { name: 'Reveal pigment' });
    expect(pigment).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('img', { name: 'Bubble Ragdoll cover used as a pigment reveal sample.' })).toBeVisible();
    act(() => fireEvent.click(pigment));
    expect(pigment).toHaveAttribute('aria-pressed', 'true');
    expect(container.querySelector('.om-lab-pigment-reveal')).toHaveClass('is-revealed');

    const seal = screen.getByRole('button', { name: /^Reveal archive seal/ });
    expect(seal.querySelector('.om-archive-seal')).toHaveAttribute('aria-hidden', 'true');
    expect(seal.querySelector('.mori-provisional-icon')).toBeNull();
    expect(seal).toHaveAttribute('aria-pressed', 'false');
    act(() => fireEvent.click(seal));
    expect(seal).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Archive seal revealed.')).toHaveAttribute('role', 'status');
  });
});
