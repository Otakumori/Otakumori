import { useEffect, useRef, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

const PETAL_COUNT = 5
const GLOBAL_PETAL_KEY = 'global_petals'
const USER_PETAL_KEY = 'user_petals'
const USER_PETAL_DATE_KEY = 'user_petals_date'
const GUEST_LIMIT = 50
const USER_LIMIT = 2500
const ACHIEVEMENTS = [10, 50, 100, 500, 1000, 2500]

function randomX() {
  return Math.random() * 80 + 10 // 10% to 90% left
}
function randomDelay() {
  return Math.random() * 4 // 0-4s
}

export default function PetalGameImage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [petals, setPetals] = useState(
    Array.from({ length: PETAL_COUNT }, (_, i) => ({
      id: i,
      x: randomX(),
      delay: randomDelay(),
      clicked: false,
    }))
  )
  const [userPetals, setUserPetals] = useState(0)
  const [globalPetals, setGlobalPetals] = useState(0)
  const [lastCollectDate, setLastCollectDate] = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [achievement, setAchievement] = useState<string | null>(null)

  useEffect(() => {
    let sakuraInstance: any
    if (containerRef.current) {
      import('sakura-js').then((mod) => {
        console.log('Sakura import:', mod)
        const SakuraConstructor = mod?.default || mod?.Sakura || mod
        if (typeof SakuraConstructor !== 'function') {
          console.error('Sakura import did not yield a constructor:', mod)
          return
        }
        sakuraInstance = new SakuraConstructor(containerRef.current, {
          // You can customize petal speed, size, colors, etc. here
        })
      })
      // Make petals clickable
      const clickHandler = (e: any) => {
        if (e.target.classList.contains('sakura')) {
          if (userPetals >= GUEST_LIMIT) {
            setLimitReached(true)
            return
          }
          setPetals((prev) =>
            prev.map((p) => (p.id === e.target.dataset.id ? { ...p, clicked: true } : p))
          )
          setUserPetals((count) => {
            const newCount = count + 1
            localStorage.setItem(USER_PETAL_KEY, String(newCount))
            if (ACHIEVEMENTS.includes(newCount)) {
              setAchievement(`Achievement unlocked: ${newCount} petals!`)
              setTimeout(() => setAchievement(null), 2500)
            }
            return newCount
          })
          e.target.style.opacity = 0
        }
      }
      containerRef.current.addEventListener('click', clickHandler)
      return () => {
        if (sakuraInstance && sakuraInstance.stop) sakuraInstance.stop()
        containerRef.current?.removeEventListener('click', clickHandler)
      }
    }
  }, [userPetals])

  // Daily reset logic
  useEffect(() => {
    const local = localStorage.getItem(USER_PETAL_KEY)
    const date = localStorage.getItem(USER_PETAL_DATE_KEY)
    if (local) setUserPetals(Number(local))
    if (date) setLastCollectDate(date)
    const today = new Date().toISOString().slice(0, 10)
    if (date !== today) {
      localStorage.setItem(USER_PETAL_KEY, '0')
      localStorage.setItem(USER_PETAL_DATE_KEY, today)
      setUserPetals(0)
      setLastCollectDate(today)
    }
  }, [])

  // Fetch global and user petal counts
  useEffect(() => {
    // Fetch global petals from Supabase
    const fetchGlobal = async () => {
      const { data } = await supabase
        .from('petal_counters')
        .select('count')
        .eq('id', GLOBAL_PETAL_KEY)
        .single()
      if (data && data.count !== undefined) setGlobalPetals(data.count)
    }
    fetchGlobal()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[2/1] overflow-hidden rounded-none md:rounded-3xl shadow-xl"
      style={{ minHeight: '320px', background: '#1a1a1a' }}
    >
      <img
        src="/assets/cherry.jpg"
        alt="Cherry Blossom Animated Tree"
        className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
        draggable={false}
      />
      {/* Clickable petals overlay */}
      {petals.map(
        (petal) =>
          !petal.clicked && (
            <div
              key={petal.id}
              className="sakura absolute top-0"
              data-id={petal.id}
              style={{
                left: `${petal.x}%`,
                top: 0,
                animationDelay: `${petal.delay}s`,
                width: '32px',
                height: '32px',
                pointerEvents: 'auto',
                zIndex: 2,
              }}
            />
          )
      )}
      {/* User petal counter */}
      <div className="absolute top-2 right-4 z-10 bg-pink-900/80 text-white px-4 py-1 rounded-full shadow-lg text-lg font-bold">
        Your Petals: {userPetals} / {GUEST_LIMIT}
      </div>
      {/* Global petal counter */}
      <div className="absolute top-2 left-4 z-10 bg-pink-700/80 text-white px-4 py-1 rounded-full shadow-lg text-lg font-bold">
        Community Petals: {globalPetals}
      </div>
      {/* Limit reached error */}
      {limitReached && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="bg-pink-800/90 text-white px-8 py-4 rounded-2xl shadow-xl text-xl font-bold animate-bounce">
            Daily petal limit reached!
          </div>
        </div>
      )}
      {/* Achievement popup */}
      {achievement && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-pink-600/90 text-white px-6 py-3 rounded-xl shadow-lg text-lg font-bold animate-pulse">
          {achievement}
        </div>
      )}
    </div>
  )
} 