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
import { CommanderArchiveShell } from '@/app/components/commander/CommanderArchive';
import { MoriSystemState } from '@/app/components/mori/MoriProduction';
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
  let profileState:
    | 'ready'
    | 'signed-out'
    | 'provisioning-unavailable'
    | 'schema-unavailable'
    | 'error' = 'signed-out';

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
      <CommanderArchiveShell
        current="profile"
        className="om-route-page om-route-page--profile mori-page"
      >
        <ProfileHeader />
        <MoriSystemState
          state="locked"
          title="Sign in to view your Otaku-mori profile"
          description="Your lifetime petals, achievements, avatar, game records, and rewards are kept here."
          action={
            <a
              href={buildCanonicalSignInUrl('/profile', appOrigin)}
              className="mori-foundation-button"
            >
              Sign In
            </a>
          }
        />
      </CommanderArchiveShell>
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
      <CommanderArchiveShell
        current="profile"
        className="om-route-page om-route-page--profile mori-page"
      >
        <ProfileHeader />
        <MoriSystemState state="unavailable" title={copy.title} description={copy.body} />
      </CommanderArchiveShell>
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
    <CommanderArchiveShell
      current="profile"
      className="om-route-page om-route-page--profile mori-page"
    >
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
              <div className="commander-profile__overview">
                <RewardsSummary />
                <section className="commander-material-region">
                  <DailyQuests />
                </section>
                <section className="commander-material-region">
                  <RecentActivity />
                </section>
              </div>
            }
            achievements={<AchievementsPanel />}
            games={
              <section className="commander-material-region">
                <h2 className="font-display mb-4 text-xl font-semibold text-[#fff1e4]">
                  Game Stats
                </h2>
                <MiniGameStats />
              </section>
            }
            cosmetics={<CosmeticsTab />}
          />
        }
      />
    </CommanderArchiveShell>
  );
}
