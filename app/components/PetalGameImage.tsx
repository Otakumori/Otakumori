import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import Particles from 'react-tsparticles'
import { loadFull } from 'tsparticles'

const GLOBAL_PETAL_KEY = 'global_petals'
const USER_PETAL_KEY = 'user_petals'
const USER_PETAL_DATE_KEY = 'user_petals_date'
const GUEST_LIMIT = 50
const USER_LIMIT = 2500
const ACHIEVEMENTS = [10, 50, 100, 500, 1000, 2500]

const petalSvg = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2C18.5 7 27 10 27 18C27 24 21 30 16 30C11 30 5 24 5 18C5 10 13.5 7 16 2Z" fill="#FFB6C1" stroke="#E75480" stroke-width="2"/></svg>`

export default function PetalGameImage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [userPetals, setUserPetals] = useState(0)
  const [globalPetals, setGlobalPetals] = useState(0)
  const [lastCollectDate, setLastCollectDate] = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [achievement, setAchievement] = useState<string | null>(null)

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

  // Particle click handler
  const handlePetalClick = useCallback((event: any) => {
    if (userPetals >= GUEST_LIMIT) {
      setLimitReached(true)
      return
    }
    setUserPetals((count) => {
      const newCount = count + 1
      localStorage.setItem(USER_PETAL_KEY, String(newCount))
      if (ACHIEVEMENTS.includes(newCount)) {
        setAchievement(`Achievement unlocked: ${newCount} petals!`)
        setTimeout(() => setAchievement(null), 2500)
      }
      return newCount
    })
  }, [userPetals])

  // Particle options
  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine)
  }, [])

  const particlesOptions = {
    fullScreen: false,
    background: { color: 'transparent' },
    particles: {
      number: { value: 24, density: { enable: true, area: 800 } },
      color: { value: '#FFB6C1' },
      shape: {
        type: 'image',
        image: [
          {
            src: 'data:image/svg+xml;base64,' + btoa(petalSvg),
            width: 32,
            height: 32,
          },
        ],
      },
      opacity: { value: 0.85 },
      size: { value: 24, random: { enable: true, minimumValue: 16 } },
      move: {
        enable: true,
        speed: 1.5,
        direction: "bottom" as const,
        random: true,
        straight: false,
        outModes: { default: "out" as const },
      },
    },
    detectRetina: true,
    interactivity: {
      events: {
        onClick: { enable: true, mode: 'repulse' },
        onHover: { enable: true, mode: 'bubble' },
      },
      modes: {
        repulse: { distance: 80, duration: 0.4 },
        bubble: { distance: 60, duration: 0.3, size: 32, opacity: 1 },
      },
    },
    emitters: [],
  }

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
      {/* Petal Particles Overlay */}
      <Particles
        id="petalParticles"
        init={particlesInit}
        options={particlesOptions}
        className="absolute inset-0 w-full h-full z-10 pointer-events-auto"
        style={{ pointerEvents: 'auto' }}
        canvasClassName="pointer-events-auto"
      />
      {/* User petal counter */}
      <div className="absolute top-2 right-4 z-20 bg-pink-900/80 text-white px-4 py-1 rounded-full shadow-lg text-lg font-bold">
        Your Petals: {userPetals} / {GUEST_LIMIT}
      </div>
      {/* Global petal counter */}
      <div className="absolute top-2 left-4 z-20 bg-pink-700/80 text-white px-4 py-1 rounded-full shadow-lg text-lg font-bold">
        Community Petals: {globalPetals}
      </div>
      {/* Limit reached error */}
      {limitReached && (
        <div className="absolute inset-0 flex items-center justify-center z-30">
          <div className="bg-pink-800/90 text-white px-8 py-4 rounded-2xl shadow-xl text-xl font-bold animate-bounce">
            Daily petal limit reached!
          </div>
        </div>
      )}
      {/* Achievement popup */}
      {achievement && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-pink-600/90 text-white px-6 py-3 rounded-xl shadow-lg text-lg font-bold animate-pulse">
          {achievement}
        </div>
      )}
    </div>
  )
} 