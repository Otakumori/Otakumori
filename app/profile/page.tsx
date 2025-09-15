import { getProfileData } from './_data/profile';
import AchievementsPanel from '../components/profile/AchievementsPanel';
import OneTapGamertag from '../components/profile/OneTapGamertag';
import DailyQuests from '../components/quests/DailyQuests';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const { user, achievements, ownedCodes, gamertag, canRenameAt } = await getProfileData();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      {/* Header */}
      <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Profile</h1>
            <p className="text-sm text-zinc-300">Your account, progress, and unlocks</p>
          </div>
        </div>
      </section>

      {/* Gamertag */}
      <OneTapGamertag initial={gamertag || undefined} />

      {/* Daily Quests */}
      <DailyQuests />

      {/* Achievements */}
      <AchievementsPanel />
    </div>
  );
}
