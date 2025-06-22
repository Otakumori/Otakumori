'use client';
import { useState, useEffect, useRef } from 'react';
import { useAchievements } from '../lib/hooks/useAchievements';

const GRID_SIZE = 4;
const CARD_EMOJIS = ['🌸', '🦊', '🎮', '🍱', '🧩', '👘', '🗡️', '🦄'];
const FACES = [...CARD_EMOJIS, ...CARD_EMOJIS];

function shuffle<T>(arr: T[]): T[] {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryMatrix() {
  const { unlockAchievement } = useAchievements();
  const [cards, setCards] = useState(() =>
    shuffle(FACES).map((face, i) => ({ id: i, face, flipped: false, matched: false }))
  );
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [solved, setSolved] = useState(false);
  const [best, setBest] = useState<{ time: number; moves: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (running && !solved) {
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, solved]);

  useEffect(() => {
    if (cards.every(c => c.matched)) {
      setSolved(true);
      setRunning(false);
      // Achievement: Memory Novice (first match)
      unlockAchievement('memory_matrix_novice');
      // Achievement: Speed of Thought (under 20s)
      if (timer <= 20) unlockAchievement('memory_matrix_speed');
      // Achievement: Perfect Recall (no mistakes)
      if (moves === 8) unlockAchievement('memory_matrix_perfect');
      // Achievement: Combo Brainiac (10+ match streak)
      if (moves <= 10) unlockAchievement('memory_matrix_combo');
      if (!best || timer < best.time || (timer === best.time && moves < best.moves)) {
        setBest({ time: timer, moves });
        localStorage.setItem('memoryMatrixBest', JSON.stringify({ time: timer, moves }));
      }
    }
  }, [cards]);

  useEffect(() => {
    const b = localStorage.getItem('memoryMatrixBest');
    if (b) setBest(JSON.parse(b));
  }, []);

  const handleFlip = (idx: number) => {
    if (solved) return;
    if (!running) setRunning(true);
    if (flipped.length === 2 || cards[idx].flipped || cards[idx].matched) return;
    const newFlipped = [...flipped, idx];
    setCards(cs => cs.map((c, i) => (i === idx ? { ...c, flipped: true } : c)));
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setTimeout(() => {
        const [a, b] = newFlipped;
        if (cards[a].face === cards[b].face) {
          setCards(cs => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
        }
        setCards(cs => cs.map((c, i) => (i === a || i === b ? c : { ...c, flipped: false })));
        setFlipped([]);
      }, 900);
    }
  };

  const handleReset = () => {
    setCards(shuffle(FACES).map((face, i) => ({ id: i, face, flipped: false, matched: false })));
    setFlipped([]);
    setMoves(0);
    setTimer(0);
    setSolved(false);
    setRunning(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(120deg, #f5e5ff 0%, #b2e0f7 100%)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 72px)`,
          gap: 8,
          marginBottom: 32,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 16px #0002',
          padding: 12,
        }}
      >
        {cards.map((c, i) => (
          <div key={c.id} style={{ perspective: 600 }}>
            <button
              onClick={() => handleFlip(i)}
              style={{
                width: 72,
                height: 72,
                fontSize: 32,
                borderRadius: 10,
                border: c.matched ? '2px solid #8bc34a' : '2px solid #bbb',
                background: c.matched ? '#e8f5e9' : c.flipped ? '#ffe082' : '#fff',
                cursor: c.matched ? 'default' : 'pointer',
                boxShadow: c.flipped ? '0 2px 8px #e7548088' : '0 2px 8px #0001',
                position: 'relative',
                transition: 'background 0.2s, border 0.2s',
              }}
              disabled={c.matched || c.flipped || flipped.length === 2}
            >
              <span
                style={{
                  display: 'block',
                  transform: c.flipped || c.matched ? 'rotateY(0deg)' : 'rotateY(180deg)',
                  transition: 'transform 0.4s cubic-bezier(.4,2,.6,1)',
                  fontSize: 36,
                  color: c.matched ? '#8bc34a' : '#e75480',
                  textShadow: c.matched ? '0 2px 8px #8bc34a88' : '0 2px 8px #e7548088',
                }}
              >
                {c.flipped || c.matched ? c.face : '?'}
              </span>
            </button>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 24, fontSize: 20, marginBottom: 12 }}>
        <span>⏱️ {timer}s</span>
        <span>🔄 {moves} moves</span>
        {best && (
          <span>
            🏆 Best: {best.time}s / {best.moves} moves
          </span>
        )}
      </div>
      {solved && (
        <div
          style={{
            fontSize: 26,
            color: '#388e3c',
            fontWeight: 700,
            marginBottom: 12,
            animation: 'pop 0.7s',
          }}
        >
          All Matched! 🎉
        </div>
      )}
      <button
        onClick={handleReset}
        style={{
          marginTop: 8,
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
      <style>{`
        @keyframes pop {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
