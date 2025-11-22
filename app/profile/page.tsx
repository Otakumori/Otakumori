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

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  let profileData = null;
  let isAuthenticated = false;

  try {
    profileData = await getProfileData();
    isAuthenticated = true;
  } catch {
    // User not authenticated - show guest view
    isAuthenticated = false;
  }

  // Guest view
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <ProfileHeader />
        <div className="mt-8 rounded-2xl border border-white/10 bg-black/50 p-12 text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Sign in to view your Otaku-mori profile
          </h2>
          <p className="text-zinc-300 mb-6 max-w-md mx-auto">
            Profiles track your lifetime petals, achievements, and avatar. Sign in to see your
            progress and unlock rewards!
          </p>
          <a
            href="/sign-in"
            className="inline-block px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
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
    <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
      {/* Steam-style Header */}
      <ProfileHeader displayName={displayName} />

      {/* Gamertag */}
      {gamertag && <OneTapGamertag initial={gamertag} />}

      {/* Two-column Layout */}
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
                {/* Rewards Summary */}
                <RewardsSummary />

                {/* Daily Quests */}
                <div className="rounded-xl border border-white/10 bg-black/50 p-5">
                  <DailyQuests />
                </div>

                {/* Recent Activity */}
                <div className="rounded-xl border border-white/10 bg-black/50 p-5">
                  <RecentActivity />
                </div>
              </div>
            }
            achievements={<AchievementsPanel />}
            games={
              <div className="rounded-xl border border-white/10 bg-black/50 p-5">
                <h2 className="text-xl font-semibold text-white mb-4">Game Stats</h2>
                <MiniGameStats />
              </div>
            }
            cosmetics={<CosmeticsTab />}
          />
        }
      />
    </div>
  );
}
