'use client';
import { useEffect, useRef, useState } from 'react';
import { useAchievements } from '../lib/hooks/useAchievements';

const CHARACTER_IMG = '/images/games/bubble-girl.png'; // Replace with your own art if desired
const BUBBLE_SFX = '/sounds/games/bubble-pop.mp3';
const BG_IMG = '/images/games/bubble-bg.jpg'; // Optional background art
const BUBBLE_COLORS = ['#aeefff', '#e1bee7', '#fff59d', '#b2dfdb', '#f8bbd0'];
const BUBBLE_COUNT = 8;

function randomX() {
  return Math.random() * 90 + '%';
}
function randomSize() {
  return 36 + Math.random() * 32;
}
function randomColor() {
  return BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
}
function randomDuration(level: number) {
  return 2.2 - Math.min(1.5, level * 0.12) + Math.random() * 0.7;
}

export default function BubbleGirl() {
  const { unlockAchievement } = useAchievements();
  const [bubbles, setBubbles] = useState(
    Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
      id: i + '-' + Math.random(),
      x: randomX(),
      size: randomSize(),
      color: randomColor(),
      duration: randomDuration(1),
      popped: false,
    }))
  );
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const comboTimer = useRef<NodeJS.Timeout | null>(null);
  const sfxRef = useRef<HTMLAudioElement>(null);

  const handlePop = (id: string) => {
    setBubbles(bs => bs.map(b => (b.id === id && !b.popped ? { ...b, popped: true } : b)));
    setScore(s => {
      const newScore = s + 1 + combo;
      // Achievement: Pop That (burst 69 bubbles)
      if (newScore >= 69) unlockAchievement('bubble_girl_popthat');
      // Achievement: Float Me Daddy (survive 5 minutes)
      // (Would require a timer, omitted for brevity)
      return newScore;
    });
    setCombo(c => {
      const newCombo = c + 1;
      // Achievement: Combo Queen/King (15+ combo)
      if (newCombo >= 15) unlockAchievement('bubble_girl_floatmedaddy');
      return newCombo;
    });
    if (sfxRef.current) (sfxRef.current.currentTime = 0), sfxRef.current.play().catch(() => {});
    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => setCombo(0), 1200);
    if ((score + 1 + combo) % 10 === 0) setLevel(l => l + 1);
  };

  useEffect(() => {
    // Remove popped bubbles and respawn new ones
    const t = setInterval(() => {
      setBubbles(bs =>
        bs.map(b =>
          b.popped
            ? {
                id: Math.random() + '-' + Date.now(),
                x: randomX(),
                size: randomSize(),
                color: randomColor(),
                duration: randomDuration(level),
                popped: false,
              }
            : b
        )
      );
    }, 900);
    return () => clearInterval(t);
  }, [resetKey, level]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: BG_IMG
          ? `url(${BG_IMG}) center/cover`
          : 'linear-gradient(to top, #e0c3fc 0%, #8ec5fc 100%)',
      }}
    >
      <audio ref={sfxRef} src={BUBBLE_SFX} preload="auto" />
      {/* Character sprite */}
      <img
        src={CHARACTER_IMG}
        alt="Bubble Girl"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 32,
          transform: 'translateX(-50%)',
          width: 120,
          height: 'auto',
          zIndex: 2,
          filter: 'drop-shadow(0 4px 16px #fff8)',
        }}
        onError={e => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Bubbles */}
      {bubbles.map((b, i) => (
        <span
          key={b.id}
          onClick={() => handlePop(b.id)}
          style={{
            position: 'absolute',
            left: b.x,
            bottom: b.popped ? '-80px' : '120px',
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: b.color,
            boxShadow: '0 2px 16px #fff8, 0 0 0 2px #fff4 inset',
            opacity: b.popped ? 0.2 : 0.85,
            cursor: b.popped ? 'default' : 'pointer',
            transition: `bottom ${b.duration}s linear, opacity 0.3s`,
            transitionDelay: b.popped ? '0s' : `${i * 0.12}s`,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Optional: SVG shine or highlight */}
          <svg width={b.size} height={b.size} style={{ position: 'absolute', left: 0, top: 0 }}>
            <ellipse
              cx={b.size * 0.4}
              cy={b.size * 0.3}
              rx={b.size * 0.18}
              ry={b.size * 0.12}
              fill="#fff6"
            />
          </svg>
        </span>
      ))}
      {/* Score and combo UI */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          fontSize: 26,
          color: '#333',
          background: '#fff8',
          borderRadius: 10,
          padding: '10px 28px',
          fontWeight: 700,
          boxShadow: '0 2px 8px #0002',
        }}
      >
        Score: {score}
      </div>
      <div
        style={{
          position: 'absolute',
          top: 24,
          right: 24,
          fontSize: 22,
          color: '#fff',
          background: '#7e57c2',
          borderRadius: 10,
          padding: '8px 20px',
          fontWeight: 700,
          boxShadow: '0 2px 8px #7e57c288',
          letterSpacing: 2,
        }}
      >
        Combo: {combo}x &nbsp;|&nbsp; Level: {level}
      </div>
      <button
        onClick={() => {
          setScore(0);
          setCombo(0);
          setLevel(1);
          setResetKey(k => k + 1);
        }}
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          fontSize: 18,
          padding: '10px 28px',
          borderRadius: 10,
          background: '#fff',
          color: '#222',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px #0003',
          fontWeight: 700,
        }}
      >
        Reset
      </button>
    </div>
  );
}
