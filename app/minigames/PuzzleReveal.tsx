'use client';
import { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 3;
const PLACEHOLDER = '🖼️';
const OPEN_ART = [
  '/images/games/puzzle1.jpg',
  '/images/games/puzzle2.jpg',
  '/images/games/puzzle3.jpg',
];

function shuffle(arr: number[]) {
  let a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PuzzleReveal() {
  const [tiles, setTiles] = useState(() => shuffle([...Array(GRID_SIZE * GRID_SIZE).keys()]));
  const [selected, setSelected] = useState<number | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [moves, setMoves] = useState(0);
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
    if (tiles.every((v, i) => v === i)) {
      setSolved(true);
      setRunning(false);
      // Save best score
      if (!best || timer < best.time || (timer === best.time && moves < best.moves)) {
        setBest({ time: timer, moves });
        localStorage.setItem('puzzleRevealBest', JSON.stringify({ time: timer, moves }));
      }
    }
  }, [tiles]);

  useEffect(() => {
    const b = localStorage.getItem('puzzleRevealBest');
    if (b) setBest(JSON.parse(b));
  }, []);

  const handleClick = (idx: number) => {
    if (solved) return;
    if (!running) setRunning(true);
    if (selected === null) {
      setSelected(idx);
    } else if (selected === idx) {
      setSelected(null);
    } else {
      const newTiles = tiles.slice();
      [newTiles[selected], newTiles[idx]] = [newTiles[idx], newTiles[selected]];
      setTiles(newTiles);
      setSelected(null);
      setMoves(m => m + 1);
    }
  };

  const handleReset = () => {
    setTiles(shuffle([...Array(GRID_SIZE * GRID_SIZE).keys()]));
    setSelected(null);
    setTimer(0);
    setMoves(0);
    setSolved(false);
    setRunning(false);
  };

  const handleImgChange = (i: number) => {
    setImgIdx(i);
    handleReset();
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
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        {OPEN_ART.map((src, i) => (
          <img
            key={i}
            src={src}
            alt="Puzzle Art"
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              border: imgIdx === i ? '3px solid #e75480' : '2px solid #bbb',
              cursor: 'pointer',
              objectFit: 'cover',
            }}
            onClick={() => handleImgChange(i)}
            onError={e => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 72px)`,
          gap: 4,
          marginBottom: 32,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 16px #0002',
          padding: 8,
        }}
      >
        {tiles.map((v, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            style={{
              width: 72,
              height: 72,
              fontSize: 32,
              background: solved ? '#c8e6c9' : selected === i ? '#ffe082' : '#fff',
              border: '2px solid #bbb',
              borderRadius: 8,
              cursor: solved ? 'default' : 'pointer',
              transition: 'background 0.2s, border 0.2s',
              overflow: 'hidden',
              position: 'relative',
            }}
            disabled={solved}
          >
            {OPEN_ART[imgIdx] ? (
              <img
                src={OPEN_ART[imgIdx]}
                alt="Tile"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${(v % GRID_SIZE) * 50}% ${Math.floor(v / GRID_SIZE) * 50}%`,
                  filter: solved ? 'grayscale(0.2) brightness(1.2)' : 'none',
                  transition: 'filter 0.3s',
                }}
              />
            ) : (
              <span>{PLACEHOLDER}</span>
            )}
          </button>
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
          Puzzle Solved! 🎉
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
