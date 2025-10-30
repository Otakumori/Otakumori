import { getProfileData } from './_data/profile';
import AchievementsPanel from '../components/profile/AchievementsPanel';
import OneTapGamertag from '../components/profile/OneTapGamertag';
import DailyQuests from '../components/quests/DailyQuests';
import Profile3DViewer from '../components/profile/Profile3DViewer';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const {
    user: _user,
    achievements: _achievements,
    ownedCodes: _ownedCodes,
    gamertag,
    canRenameAt: _canRenameAt,
  } = await getProfileData();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      {/* Header */}
      <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* 3D Avatar Display */}
            <Profile3DViewer
              size="medium"
              interactive={true}
              showControls={true}
              quality="high"
              className="rounded-lg border border-white/20"
            />

            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-white">Profile</h1>
              <p className="text-sm text-zinc-300">Your account, progress, and unlocks</p>

              {/* User Info */}
              {_user && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-zinc-400">
                    {_user.emailAddresses?.[0]?.emailAddress || 'No email'}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Joined{' '}
                    {_user.createdAt ? new Date(_user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Gamertag Rename Info */}
          {_canRenameAt && (
            <div className="text-right">
              <p className="text-xs text-zinc-400">Next rename available:</p>
              <p className="text-sm text-zinc-300">{new Date(_canRenameAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </section>

      {/* Gamertag */}
      {gamertag && <OneTapGamertag initial={gamertag} />}

      {/* Daily Quests */}
      <DailyQuests />

      {/* Owned Codes */}
      {_ownedCodes && Array.isArray(_ownedCodes) && _ownedCodes.length > 0 && (
        <section className="rounded-2xl border border-white/10 bg-black/50 p-5">
          <h2 className="text-xl font-semibold text-white mb-4">Your Redemption Codes</h2>
          <div className="grid gap-3">
            {_ownedCodes.map((code: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div>
                  <p className="text-white font-medium">{code.code}</p>
                  <p className="text-sm text-zinc-400">{code.description || 'No description'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">
                    {code.redeemedAt
                      ? `Redeemed ${new Date(code.redeemedAt).toLocaleDateString()}`
                      : 'Available'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Achievements */}
      <AchievementsPanel />
    </div>
  );
}
