import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase/client';

export default function PetalStats() {
  const [progress, setProgress] = useState(0);
  const [goal, setGoal] = useState(25000);
  const [season, setSeason] = useState('Spring');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!supabase) {
        console.warn('Supabase client not available');
        setLoading(false);
        return;
      }
      // Example: fetch from a 'seasonal_progress' table
      const { data, error } = await supabase
        .from('seasonal_progress')
        .select('season, progress, goal')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (!error && data) {
        setProgress(data.progress);
        setGoal(data.goal);
        setSeason(data.season);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const percent = Math.min(100, Math.round((progress / goal) * 100));

  return (
    <div className="mx-auto mb-4 mt-8 w-full max-w-2xl px-4">
      <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-lg font-bold text-pink-600">Seasonal Petal Progress</span>
          <span className="font-semibold text-pink-500">
            {season}: {loading ? '...' : `${progress.toLocaleString()} / ${goal.toLocaleString()}`}
          </span>
        </div>
        <div className="h-4 w-full overflow-hidden rounded-full bg-pink-100">
          <div
            className="h-4 rounded-full bg-pink-500 transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
