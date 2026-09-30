import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('Selected archive: Relics');

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Seal / stamp' })));
    expect(screen.getByText('seal confirmation previewed.')).toBeVisible();

    act(() => fireEvent.click(screen.getByRole('button', { name: 'Relic aperture' })));
    expect(container.querySelector('.om-lab-transition-stage')).toHaveAttribute('data-transition', 'aperture');
  });
});
