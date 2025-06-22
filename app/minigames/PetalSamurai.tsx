'use client';
import { useEffect, useRef, useState } from 'react';
import { useAchievements } from '../lib/hooks/useAchievements';

const PETAL = '°❀.ೃ࿔* ';
const NINJA = '忍者';
const PETAL_COUNT = 10;
const MUSIC_SRC = '/sounds/games/petal-samurai.mp3';
const FEMALE_SKIN =
  '/assets/sprites/GandalfHardcore Character Asset Pack/GandalfHardcore Character Asset Pack/Character skin colors/Female Skin1.png';
const FEMALE_HAIR =
  '/assets/sprites/GandalfHardcore Character Asset Pack/GandalfHardcore Character Asset Pack/Female Hair/Female Hair1.png';
const FEMALE_CLOTHING =
  '/assets/sprites/GandalfHardcore Character Asset Pack/GandalfHardcore Character Asset Pack/Female Clothing/Corset.png';
const FEMALE_BOOTS =
  '/assets/sprites/GandalfHardcore Character Asset Pack/GandalfHardcore Character Asset Pack/Female Clothing/Boots.png';
const FEMALE_SWORD =
  '/assets/sprites/GandalfHardcore Character Asset Pack/GandalfHardcore Character Asset Pack/Female Hand/Female Sword.png';

function randomX() {
  return Math.random() * 90 + '%';
}

function randomDuration() {
  return 2 + Math.random() * 2;
}

function randomRotate() {
  return Math.random() * 360;
}

export default function PetalSamurai() {
  const { unlockAchievement } = useAchievements();
  const [petals, setPetals] = useState(
    Array.from({ length: PETAL_COUNT }, (_, i) => ({
      id: i + '-' + Math.random(),
      x: randomX(),
      duration: randomDuration(),
      rotate: randomRotate(),
      sliced: false,
    }))
  );
  const [score, setScore] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const comboTimer = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleSlice = (id: string) => {
    setPetals(petals => petals.map(p => (p.id === id && !p.sliced ? { ...p, sliced: true } : p)));
    setScore(s => {
      const newScore = s + 1 * multiplier;
      // Achievement: Slice 100 petals in one round
      if (newScore >= 100) unlockAchievement('petal_samurai_100slice');
      // Achievement: Sliced in Silence (if audio muted and score >= 1000)
      if (audioRef.current && audioRef.current.volume === 0 && newScore >= 1000)
        unlockAchievement('petal_samurai_silence');
      return newScore;
    });
    setCombo(c => {
      const newCombo = c + 1;
      // Achievement: Edge Lord (combo streak 20)
      if (newCombo === 20) unlockAchievement('petal_samurai_edgelord');
      // Achievement: Zen Is a Lie (swing 50+ times in 10s)
      // (This would require a swing counter and timer, omitted for brevity)
      return newCombo;
    });
    setMultiplier(m => Math.min(5, m + 1));
    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => {
      setCombo(0);
      setMultiplier(1);
    }, 1200);
  };

  useEffect(() => {
    // Remove sliced petals and respawn new ones
    const t = setInterval(() => {
      setPetals(petals =>
        petals.map(p =>
          p.sliced
            ? {
                id: Math.random() + '-' + Date.now(),
                x: randomX(),
                duration: randomDuration(),
                rotate: randomRotate(),
                sliced: false,
              }
            : p
        )
      );
    }, 900);
    return () => clearInterval(t);
  }, [resetKey]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.25;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => {});
    }
  }, [resetKey]);

  useEffect(() => {
    // Achievement: All Petal, No Metal (lose with 0 slashes)
    if (score === 0 && resetKey > 0) unlockAchievement('petal_samurai_nometal');
    // Achievement: Don't Touch My Petals (miss 0 petals in a full session)
    // (Would require tracking missed petals, omitted for brevity)
  }, [resetKey]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(to top, #f9e6ff 0%, #b2d8f7 100%)',
      }}
    >
      <audio ref={audioRef} src={MUSIC_SRC} preload="auto" />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 32,
          transform: 'translateX(-50%)',
          width: 96,
          height: 128,
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <div className="samurai-idle">
          <img
            src={FEMALE_SKIN}
            alt="Samurai Skin"
            style={{ position: 'absolute', width: 96, height: 128, zIndex: 1 }}
          />
          <img
            src={FEMALE_HAIR}
            alt="Samurai Hair"
            style={{
              position: 'absolute',
              width: 96,
              height: 128,
              zIndex: 2,
              animation: 'hair-sway 2.2s ease-in-out infinite',
            }}
          />
          <img
            src={FEMALE_CLOTHING}
            alt="Samurai Clothing"
            style={{ position: 'absolute', width: 96, height: 128, zIndex: 3 }}
          />
          <img
            src={FEMALE_BOOTS}
            alt="Samurai Boots"
            style={{ position: 'absolute', width: 96, height: 128, zIndex: 4 }}
          />
          <img
            src={FEMALE_SWORD}
            alt="Samurai Sword"
            style={{
              position: 'absolute',
              width: 96,
              height: 128,
              zIndex: 5,
              animation: 'sword-bounce 1.8s ease-in-out infinite',
            }}
          />
        </div>
      </div>
      <style>{`
        .samurai-idle {
          position: relative;
          width: 96px;
          height: 128px;
          animation: idle-bounce 2s ease-in-out infinite;
        }
        @keyframes idle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes hair-sway {
          0%, 100% { transform: rotate(-2deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes sword-bounce {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
      `}</style>
      {petals.map((p, i) => (
        <span
          key={p.id}
          onClick={() => handleSlice(p.id)}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.sliced ? '110%' : '-40px',
            fontSize: 36 + Math.random() * 18,
            cursor: p.sliced ? 'default' : 'pointer',
            userSelect: 'none',
            transition: `top ${p.duration}s linear, transform ${p.duration}s linear`,
            transitionDelay: p.sliced ? '0s' : `${i * 0.18}s`,
            transform: `rotate(${p.rotate}deg)`,
            filter: p.sliced ? 'blur(2px) opacity(0.3)' : 'drop-shadow(0 2px 8px #fff8)',
            color: '#e75480',
            textShadow: '0 2px 8px #fff8',
          }}
        >
          {PETAL}
        </span>
      ))}
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
          background: '#e75480',
          borderRadius: 10,
          padding: '8px 20px',
          fontWeight: 700,
          boxShadow: '0 2px 8px #e7548088',
          letterSpacing: 2,
        }}
      >
        Combo: {combo}x &nbsp;|&nbsp; Multiplier: {multiplier}x
      </div>
      <button
        onClick={() => {
          setScore(0);
          setCombo(0);
          setMultiplier(1);
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
