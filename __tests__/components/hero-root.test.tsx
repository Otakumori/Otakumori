import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import HeroRoot from '@/app/components/hero/HeroRoot';

describe('HeroRoot', () => {
  it('renders the core funnel entry points without requiring browser-only setup', () => {
    render(<HeroRoot />);

    expect(screen.getByRole('heading', { name: /otaku-mori remembers the path/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /shop relic drops/i })).toHaveAttribute('href', '/shop');
    expect(screen.getByRole('link', { name: /enter arcade/i })).toHaveAttribute('href', '/mini-games');
    expect(screen.getByRole('link', { name: /join the grove/i })).toHaveAttribute('href', '/community');
  });
});
