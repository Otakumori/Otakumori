'use client';

/**
 * Recent activity feed component
 * TODO: Wire into real activity API when available
 */
export default function RecentActivity() {
  // Stub data - TODO: Replace with real activity feed
  const activities = [
    { type: 'game', text: 'Played Petal Samurai', time: '2 hours ago' },
    { type: 'achievement', text: 'Unlocked "First Bloom"', time: '1 day ago' },
    { type: 'cosmetic', text: 'Purchased Quake HUD', time: '3 days ago' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">No recent activity</p>
      ) : (
        activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="w-2 h-2 rounded-full bg-pink-500" />
            <div className="flex-1">
              <p className="text-sm text-white">{activity.text}</p>
              <p className="text-xs text-zinc-400">{activity.time}</p>
            </div>
          </div>
        ))
      )}
      {/* TODO: Wire into real activity API endpoint */}
      <p className="text-xs text-zinc-500 italic mt-4">
        Activity feed coming soon
      </p>
    </div>
  );
}

