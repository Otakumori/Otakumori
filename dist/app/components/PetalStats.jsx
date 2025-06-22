'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = PetalStats;
const react_1 = require('react');
const supabaseClient_1 = require('../../lib/supabaseClient');
function PetalStats() {
  const [progress, setProgress] = (0, react_1.useState)(0);
  const [goal, setGoal] = (0, react_1.useState)(25000);
  const [season, setSeason] = (0, react_1.useState)('Spring');
  const [loading, setLoading] = (0, react_1.useState)(true);
  (0, react_1.useEffect)(() => {
    async function fetchStats() {
      // Example: fetch from a 'seasonal_progress' table
      const { data, error } = await supabaseClient_1.supabase
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
