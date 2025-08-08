'use client';
import { useEffect, useRef, useState } from 'react';
import { useAchievements } from '@/lib/hooks/useAchievements';

const CHARACTER_IMG = 'https://i.pinimg.com/1200x/51/dd/0d/51dd0d34730c783541a4138d4a17da43.jpg'; // User-provided sprite
const BUBBLE_SFX = 'https://cdn.fesliyanstudios.com/audio/8%20Bit%20Adventure.mp3'; // Example: Bubble pop sound
const BG_IMG =
  'https://images.squarespace-cdn.com/content/v1/55b3b4afe4b0a813f74ebbd8/1553457479174-SF28TJIGONX4MKBVSJCW/PixelBubble_GiphySticker_smaller.gif?format=1000w'; // User-provided background
const COMBO_SFX = 'https://cdn.fesliyanstudios.com/audio/Boss%20Time.mp3';
const BG_MUSIC = 'https://cdn.fesliyanstudios.com/audio/Arcade%20Kid.mp3';
const BUBBLE_COLORS = ['#aeefff', '#e1bee7', '#fff59d', '#b2dfdb', '#f8bbd0'];
const GOLDEN_COLOR = '#ffe066';
const BUBBLE_COUNT = 8;

function randomX() {
  return Math.random() * 90 + '%';
}
function randomSize() {
  return 36 + Math.random() * 32;
}
function randomColor() {
  // 1 in 12 chance for golden bubble
  return Math.random() < 1 / 12
    ? GOLDEN_COLOR
    : BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)];
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
      popAnim: false,
    }))
  );
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [level, setLevel] = useState(1);
  const [resetKey, setResetKey] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const comboTimer = useRef<NodeJS.Timeout | null>(null);
  const sfxRef = useRef<HTMLAudioElement>(null);
  const comboSfxRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);

  // Floating animation for character
  const [floatY, setFloatY] = useState(0);
  useEffect(() => {
    let t = 0;
    let anim = () => {
      setFloatY(Math.sin(t / 20) * 12);
      t++;
      requestAnimationFrame(anim);
    };
    anim();
  }, []);

  // Music control
  useEffect(() => {
    if (musicRef.current) {
      if (musicOn) {
        musicRef.current.volume = 0.5;
        musicRef.current.play().catch(() => {});
      } else {
        musicRef.current.pause();
      }
    }
  }, [musicOn, resetKey]);

  // Bubble pop logic
  const handlePop = (id: string, color: string) => {
    setBubbles(bs =>
      bs.map(b => (b.id === id && !b.popped ? { ...b, popped: true, popAnim: true } : b))
    );
    setScore(s => {
      const bonus = color === GOLDEN_COLOR ? 10 : 1;
      const newScore = s + bonus + combo;
      if (newScore >= 69) unlockAchievement('bubble_girl_popthat');
      return newScore;
    });
    setCombo(c => {
      const newCombo = c + 1;
      if (newCombo >= 15 && comboSfxRef.current) comboSfxRef.current.play().catch(() => {});
      if (newCombo >= 15) unlockAchievement('bubble_girl_floatmedaddy');
      return newCombo;
    });
    if (sfxRef.current) ((sfxRef.current.currentTime = 0), sfxRef.current.play().catch(() => {}));
    if (comboTimer.current) clearTimeout(comboTimer.current);
    comboTimer.current = setTimeout(() => setCombo(0), 1200);
    if ((score + 1 + combo) % 10 === 0) setLevel(l => l + 1);
    // Game over condition (optional: e.g. after 100 pops)
    if (score + 1 + combo >= 100) setGameOver(true);
  };

  // Remove popped bubbles and respawn new ones
  useEffect(() => {
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
                popAnim: false,
              }
            : b
        )
      );
    }, 900);
    return () => clearInterval(t);
  }, [resetKey, level]);

  // Progress bar for level
  const progress = Math.min(1, (score % 10) / 10);

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
      <audio ref={comboSfxRef} src={COMBO_SFX} preload="auto" />
      <audio ref={musicRef} src={BG_MUSIC} preload="auto" loop />
      {/* Music toggle */}
      <button
        onClick={() => setMusicOn(m => !m)}
        style={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          fontSize: 18,
          borderRadius: 8,
          padding: '6px 18px',
          background: '#fff8',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 700,
        }}
      >
        {musicOn ? 'Pause Music' : 'Play Music'}
      </button>
      {/* Character sprite with floating animation */}
      <img
        src={CHARACTER_IMG}
        alt="Bubble Girl"
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 32 + floatY,
          transform: 'translateX(-50%)',
          width: 120,
          height: 'auto',
          zIndex: 2,
          filter: 'drop-shadow(0 4px 16px #fff8)',
          transition: 'bottom 0.3s',
        }}
        onError={e => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {/* Bubbles */}
      {bubbles.map((b, i) => (
        <span
          key={b.id}
          onClick={() => handlePop(b.id, b.color)}
          style={{
            position: 'absolute',
            left: b.x,
            bottom: b.popped ? '-80px' : '120px',
            width: b.size,
            height: b.size,
            borderRadius: '50%',
            background: b.color,
            boxShadow:
              b.color === GOLDEN_COLOR
                ? '0 0 24px 8px #ffe06688, 0 2px 16px #fff8, 0 0 0 2px #fff4 inset'
                : '0 2px 16px #fff8, 0 0 0 2px #fff4 inset',
            opacity: b.popped ? 0.2 : 0.85,
            cursor: b.popped ? 'default' : 'pointer',
            transition: `bottom ${b.duration}s linear, opacity 0.3s, transform 0.3s`,
            transitionDelay: b.popped ? '0s' : `${i * 0.12}s`,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: b.popAnim ? 'scale(1.3) rotate(12deg)' : 'none',
            border: b.color === GOLDEN_COLOR ? '3px solid #ffd700' : undefined,
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
      {/* Progress bar for level */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 320,
          height: 18,
          background: '#fff8',
          borderRadius: 10,
          boxShadow: '0 2px 8px #0002',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #ffd700, #e57373, #7e57c2)',
            borderRadius: 10,
            transition: 'width 0.3s',
          }}
        />
      </div>
      {/* Score and combo UI */}
      <div
        style={{
          position: 'absolute',
          top: 110,
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
          top: 110,
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
      {/* Game Over Modal */}
      {gameOver && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              padding: 48,
              fontSize: 32,
              fontWeight: 900,
              color: '#7e57c2',
              boxShadow: '0 4px 32px #0008',
            }}
          >
            🎉 Game Over! 🎉
            <br />
            Final Score: {score}
          </div>
          <button
            onClick={() => {
              setScore(0);
              setCombo(0);
              setLevel(1);
              setResetKey(k => k + 1);
              setGameOver(false);
            }}
            style={{
              marginTop: 32,
              fontSize: 22,
              padding: '12px 36px',
              borderRadius: 12,
              background: '#7e57c2',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0004',
            }}
          >
            Play Again
          </button>
        </div>
      )}
      {/* Reset button */}
      <button
        onClick={() => {
          setScore(0);
          setCombo(0);
          setLevel(1);
          setResetKey(k => k + 1);
          setGameOver(false);
        }}
        style={{
          position: 'absolute',
          bottom: 32,
          right: 32,
          fontSize: 18,
          padding: '10px 28px',
          borderRadius: 10,
          background: '#fff8',
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px #0002',
        }}
      >
        Reset
      </button>
    </div>
  );
}
