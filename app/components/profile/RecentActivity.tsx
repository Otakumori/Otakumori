'use client';

import { useEffect, useState } from 'react';

interface Activity {
  id: string;
  type: string;
  text: string;
  icon: string;
  time: string;
  createdAt: string;
  payload: any;
}

interface ActivityFeedResponse {
  ok: boolean;
  data?: {
    activities: Activity[];
    total: number;
    hasMore: boolean;
  };
  error?: string;
}

/**
 * Recent activity feed component
 * Fetches real activity data from API
 */
export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/activity/feed?limit=10');
        const data: ActivityFeedResponse = await response.json();

        if (data.ok && data.data) {
          setActivities(data.data.activities);
        } else {
          setError(data.error || 'Failed to load activities');
        }
      } catch (err) {
        setError('Failed to load activities');
        console.error('Activity feed error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
          <p className="text-sm text-zinc-400">Loading activities...</p>
        </div>
      ) : error ? (
        <p className="text-sm text-zinc-400 text-center py-4">{error}</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-zinc-400 text-center py-4">No recent activity</p>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="text-lg">{activity.icon}</div>
            <div className="flex-1">
              <p className="text-sm text-white">{activity.text}</p>
              <p className="text-xs text-zinc-400">{activity.time}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

