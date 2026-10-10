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
      <h2 className="font-display mb-4 text-xl text-[#fff1e4]">Recent Activity</h2>
      {loading ? (
        <div className="py-4" aria-busy="true" role="status">
          <p className="text-sm text-[#9f928a]">Loading activities…</p>
        </div>
      ) : error ? (
        <p className="py-4 text-sm text-[#9f928a]" role="status">
          Recent activity is temporarily unavailable.
        </p>
      ) : activities.length === 0 ? (
        <p className="py-4 text-sm text-[#9f928a]">No recent activity</p>
      ) : (
        activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 border-t border-[#896f48]/20 py-3"
          >
            <div className="text-lg" aria-hidden="true">
              {activity.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm text-[#fff1e4]">{activity.text}</p>
              <p className="text-xs text-[#9f928a]">{activity.time}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
