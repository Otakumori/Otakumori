import { generateSEO } from '@/app/lib/seo';
import { getProfileData } from './_data/profile';
import AchievementsPanel from '../components/profile/AchievementsPanel';
import OneTapGamertag from '../components/profile/OneTapGamertag';
import DailyQuests from '../components/quests/DailyQuests';
import RewardsSummary from '../components/profile/RewardsSummary';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileLayout from '../components/profile/ProfileLayout';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfileAvatarCard from '../components/profile/ProfileAvatarCard';
import ProfileStatsCard from '../components/profile/ProfileStatsCard';
import MiniGameStats from '../components/profile/MiniGameStats';
import RecentActivity from '../components/profile/RecentActivity';
import CosmeticsTab from '../components/profile/CosmeticsTab';
import { buildCanonicalSignInUrl } from '@/app/lib/auth/accountUrls';
import { resolveServerAppOrigin } from '@/app/lib/auth/serverAppOrigin';
import {
  AuthenticationRequiredError,
  LocalUserUnavailableError,
  isMissingSchemaError,
} from '@/app/lib/auth/viewer';

export const dynamic = 'force-dynamic';

export function generateMetadata() {
  return generateSEO({
    title: 'Profile',
    description: 'View user profile',
    url: '/profile',
  });
}

export default async function ProfilePage() {
  let profileData = null;
  let profileState: 'ready' | 'signed-out' | 'provisioning-unavailable' | 'schema-unavailable' | 'error' =
    'signed-out';

  try {
    profileData = await getProfileData();
    profileState = 'ready';
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) {
      profileState = 'signed-out';
    } else if (error instanceof LocalUserUnavailableError) {
      profileState = 'provisioning-unavailable';
    } else if (isMissingSchemaError(error)) {
      profileState = 'schema-unavailable';
    } else {
      profileState = 'error';
    }
  }

  if (profileState === 'signed-out') {
    const appOrigin = await resolveServerAppOrigin();

    return (
      <main className="mori-page pt-24">
        <div className="mori-shell py-10">
          <ProfileHeader />
          <div className="mori-panel mt-8 p-8 text-center sm:p-12">
            <h2 className="font-display text-2xl font-semibold text-[#fff1e4]">
              Sign in to view your Otaku-mori profile
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#cdbbb7] sm:text-base">
              Profiles track your lifetime petals, achievements, avatar, game records, and rewards.
            </p>
            <a href={buildCanonicalSignInUrl('/profile', appOrigin)} className="mori-button-primary mt-6">
              Sign In
            </a>
          </div>
        </div>
      </main>
    );
  }

  if (profileState !== 'ready') {
    const copy = {
      'provisioning-unavailable': {
        title: 'Profile setup is temporarily unavailable',
        body: 'You are signed in, but Otaku-mori could not prepare your local profile data yet. Please try again shortly.',
      },
      'schema-unavailable': {
        title: 'Profile data is being prepared',
        body: 'Your session is active, but the profile database is not ready for this feature yet.',
      },
      error: {
        title: 'Profile temporarily unavailable',
        body: 'We could not load your profile right now. Please try again later.',
      },
    }[profileState];

    return (
      <main className="mori-page pt-24">
        <div className="mori-shell py-10">
          <ProfileHeader />
          <div className="mori-panel mt-8 border-[#a9855f]/25 p-8 text-center sm:p-12">
            <h2 className="font-display text-2xl font-semibold text-[#fff1e4]">{copy.title}</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#cdbbb7] sm:text-base">{copy.body}</p>
          </div>
        </div>
      </main>
    );
  }

  const {
    user: _user,
    achievements: _achievements,
    ownedCodes: _ownedCodes,
    gamertag,
    canRenameAt: _canRenameAt,
  } = profileData!;

  const displayName = _user?.fullName || _user?.username || 'Wanderer';

  return (
    <main className="mori-page pt-24">
      <div className="mori-shell space-y-8 py-10">
        <ProfileHeader displayName={displayName} />

        {gamertag && <OneTapGamertag initial={gamertag} />}

        <ProfileLayout
          left={
            <>
              <ProfileAvatarCard />
              <ProfileStatsCard />
            </>
          }
          right={
            <ProfileTabs
              overview={
                <div className="space-y-6">
                  <RewardsSummary />
                  <div className="mori-panel p-5">
                    <DailyQuests />
                  </div>
                  <div className="mori-panel p-5">
                    <RecentActivity />
                  </div>
                </div>
              }
              achievements={<AchievementsPanel />}
              games={
                <div className="mori-panel p-5">
                  <h2 className="font-display mb-4 text-xl font-semibold text-[#fff1e4]">Game Stats</h2>
                  <MiniGameStats />
                </div>
              }
              cosmetics={<CosmeticsTab />}
            />
          }
        />
      </div>
    </main>
  );
}
