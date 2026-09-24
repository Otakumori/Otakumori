import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AchievementsGrid from '@/app/components/profile/AchievementsGrid';

vi.mock('next/image', () => ({
  default: ({ alt, ...props }: any) => <img alt={alt} {...props} />,
}));

vi.mock('@/app/components/GlassPanel', () => ({
  default: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

const lockedAchievement = {
  id: 'first-steps',
  name: 'First Steps',
  description: 'Begin the path',
  icon: 'first-steps.png',
  unlocked: false,
  rarity: 'common' as const,
};

const unlockedAchievement = {
  ...lockedAchievement,
  id: 'petal-master',
  name: 'Petal Master',
  unlocked: true,
  rarity: 'rare' as const,
};

function progressBar(container: HTMLElement, expectedPercentage: number) {
  return container.querySelector(
    `div[style*="width: ${expectedPercentage}%"]`,
  ) as HTMLElement | null;
}

describe('AchievementsGrid progress summary', () => {
  it('renders empty achievements as 0% with the empty-state panel', () => {
    const { container } = render(<AchievementsGrid achievements={[]} />);
    const renderedText = container.textContent ?? '';

    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('No relics discovered yet')).toBeInTheDocument();
    expect(
      screen.getByText('Play, explore, and return when the first mark is earned.'),
    ).toBeInTheDocument();
    expect(progressBar(container, 0)).toBeInTheDocument();
    expect(renderedText).not.toContain('NaN');
    expect(renderedText).not.toContain('Infinity');
  });

  it('keeps non-empty progress correct', () => {
    const { container } = render(
      <AchievementsGrid achievements={[unlockedAchievement, lockedAchievement]} />,
    );

    expect(screen.getByText('1 of 2 relics discovered')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(progressBar(container, 50)).toBeInTheDocument();
  });

  it('renders all-unlocked progress as 100%', () => {
    const { container } = render(<AchievementsGrid achievements={[unlockedAchievement]} />);

    expect(screen.getByText('1 of 1 relics discovered')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(progressBar(container, 100)).toBeInTheDocument();
  });
});
