'use client';
import { useEffect, useRef, useState } from 'react';

export default function GameCubeBoot({ onBootComplete }: { onBootComplete: () => void }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Play boot sound if available
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    // Show prompt after animation (2.5s)
    const t = setTimeout(() => setShowPrompt(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#111',
      }}
    >
      {/* Placeholder spinning cube */}
      <div
        style={{
          width: 120,
          height: 120,
          marginBottom: 32,
          perspective: 600,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#6cf',
            borderRadius: 16,
            boxShadow: '0 0 32px #6cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 48,
            color: '#fff',
            fontWeight: 'bold',
            animation: 'spin 2.5s linear',
          }}
        >
          <span role="img" aria-label="cube">
            🟦
          </span>
        </div>
      </div>
      <audio ref={audioRef} src="/sounds/games/boot.mp3" preload="auto" />
      {showPrompt && (
        <button
          onClick={onBootComplete}
          style={{
            background: '#fff',
            color: '#222',
            fontSize: 24,
            padding: '12px 32px',
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0006',
          }}
        >
          Press Start
        </button>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(720deg); }
        }
      `}</style>
    </div>
  );
}
