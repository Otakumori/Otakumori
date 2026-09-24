import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ProfilePage from '@/app/profile/page';
import { getProfileData } from '@/app/profile/_data/profile';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
} from '@/app/lib/auth/viewer';

vi.mock('server-only', () => ({}));

vi.mock('@/app/profile/_data/profile', () => ({
  getProfileData: vi.fn(),
}));

vi.mock('@/app/lib/auth/viewer', () => ({
  AuthenticationRequiredError: class AuthenticationRequiredError extends Error {},
  LocalUserUnavailableError: class LocalUserUnavailableError extends Error {},
  isMissingSchemaError: vi.fn((error: any) => error?.code === 'P2022'),
}));

vi.mock('@/app/lib/auth/serverAppOrigin', () => ({
  resolveServerAppOrigin: vi.fn().mockResolvedValue('https://www.otaku-mori.com'),
}));

vi.mock('@/app/components/profile/ProfileHeader', () => ({
  default: ({ displayName }: { displayName?: string }) => <header>{displayName ?? 'Profile'}</header>,
}));

vi.mock('@/app/components/profile/ProfileLayout', () => ({
  default: ({ left, right }: { left: ReactNode; right: ReactNode }) => (
    <section>
      {left}
      {right}
    </section>
  ),
}));

vi.mock('@/app/components/profile/ProfileTabs', () => ({
  default: () => <div>Profile tabs</div>,
}));

vi.mock('@/app/components/profile/ProfileAvatarCard', () => ({ default: () => <div>Avatar</div> }));
vi.mock('@/app/components/profile/ProfileStatsCard', () => ({ default: () => <div>Stats</div> }));
vi.mock('@/app/components/profile/AchievementsPanel', () => ({ default: () => <div>Achievements</div> }));
vi.mock('@/app/components/profile/OneTapGamertag', () => ({ default: () => <div>Gamertag</div> }));
vi.mock('@/app/components/quests/DailyQuests', () => ({ default: () => <div>Quests</div> }));
vi.mock('@/app/components/profile/RewardsSummary', () => ({ default: () => <div>Rewards</div> }));
vi.mock('@/app/components/profile/MiniGameStats', () => ({ default: () => <div>Games</div> }));
vi.mock('@/app/components/profile/RecentActivity', () => ({ default: () => <div>Activity</div> }));
vi.mock('@/app/components/profile/CosmeticsTab', () => ({ default: () => <div>Cosmetics</div> }));

describe('profile authenticated state boundary', () => {
  it('shows sign-in only when no Clerk session exists', async () => {
    vi.mocked(getProfileData).mockRejectedValue(new AuthenticationRequiredError());

    const html = renderToStaticMarkup(await ProfilePage());

    expect(html).toContain('Sign in to view your Otaku-mori profile');
  });

  it('does not show sign-in when a signed-in local profile cannot be provisioned', async () => {
    vi.mocked(getProfileData).mockRejectedValue(new LocalUserUnavailableError());

    const html = renderToStaticMarkup(await ProfilePage());

    expect(html).toContain('Profile setup is temporarily unavailable');
    expect(html).not.toContain('Sign in to view your Otaku-mori profile');
  });

  it('does not show sign-in when schema readiness fails', async () => {
    vi.mocked(getProfileData).mockRejectedValue({ code: 'P2022' });

    const html = renderToStaticMarkup(await ProfilePage());

    expect(html).toContain('Profile data is being prepared');
    expect(html).not.toContain('Sign in to view your Otaku-mori profile');
  });

  it('omits the gamertag forge when a signed-in profile has no gamertag', async () => {
    vi.mocked(getProfileData).mockResolvedValue({
      viewer: { localUserId: 'user_local' },
      user: { fullName: 'Mori Wanderer' },
      achievements: [],
      ownedCodes: new Set(),
      gamertag: null,
      canRenameAt: null,
    } as any);

    const html = renderToStaticMarkup(await ProfilePage());

    expect(html).toContain('Mori Wanderer');
    expect(html).not.toContain('Gamertag');
  });
});
