import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function PetalStats() {
  const [progress, setProgress] = useState(0)
  const [goal, setGoal] = useState(25000)
  const [season, setSeason] = useState('Spring')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      // Example: fetch from a 'seasonal_progress' table
      const { data, error } = await supabase
        .from('seasonal_progress')
        .select('season, progress, goal')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (!error && data) {
        setProgress(data.progress)
        setGoal(data.goal)
        setSeason(data.season)
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  const percent = Math.min(100, Math.round((progress / goal) * 100))

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 mb-4 px-4">
      <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg font-bold text-pink-600">Seasonal Petal Progress</span>
          <span className="text-pink-500 font-semibold">{season}: {loading ? '...' : `${progress.toLocaleString()} / ${goal.toLocaleString()}`}</span>
        </div>
        <div className="w-full bg-pink-100 rounded-full h-4 overflow-hidden">
          <div
            className="bg-pink-500 h-4 rounded-full transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  )
} 