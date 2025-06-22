'use client';
import { useState } from 'react';
import { games } from './gamesConfig';
import GameCubeBoot from './GameCubeBoot';
import GameCubeMenu from './GameCubeMenu';
import PetalSamurai from './PetalSamurai';
import PuzzleReveal from './PuzzleReveal';
import BrickBreaker from './BrickBreaker';
import BubbleGirl from './BubbleGirl';

export default function MiniGamesPage() {
  const [booted, setBooted] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [isAdult, setIsAdult] = useState(false);
  const [showNsfwModal, setShowNsfwModal] = useState(false);

  const handleSelect = (id: string) => {
    const game = games.find(g => g.id === id);
    if (game?.nsfw && !isAdult) {
      setShowNsfwModal(true);
      return;
    }
    setSelected(id);
  };

  if (!booted) {
    return <GameCubeBoot onBootComplete={() => setBooted(true)} />;
  }

  if (selected) {
    const game = games.find(g => g.id === selected);
    if (selected === 'petal-samurai') {
      return (
        <div
          style={{
            background: '#181818',
            minHeight: '100vh',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <PetalSamurai />
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              fontSize: 18,
              padding: '10px 32px',
              borderRadius: 8,
              background: '#fff',
              color: '#222',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0006',
              zIndex: 10,
            }}
          >
            Back to Menu
          </button>
        </div>
      );
    }
    if (selected === 'puzzle-reveal') {
      return (
        <div
          style={{
            background: 'linear-gradient(120deg, #f5e5ff 0%, #b2e0f7 100%)',
            minHeight: '100vh',
            color: '#222',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <PuzzleReveal />
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              fontSize: 18,
              padding: '10px 32px',
              borderRadius: 8,
              background: '#fff',
              color: '#222',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0006',
              zIndex: 10,
            }}
          >
            Back to Menu
          </button>
        </div>
      );
    }
    if (selected === 'brick-breaker') {
      return (
        <div
          style={{
            background: '#f3e5f5',
            minHeight: '100vh',
            color: '#222',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <BrickBreaker />
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              fontSize: 18,
              padding: '10px 32px',
              borderRadius: 8,
              background: '#fff',
              color: '#222',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0006',
              zIndex: 10,
            }}
          >
            Back to Menu
          </button>
        </div>
      );
    }
    if (selected === 'bubble-girl') {
      return (
        <div
          style={{
            background: 'linear-gradient(to top, #e0c3fc 0%, #8ec5fc 100%)',
            minHeight: '100vh',
            color: '#222',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          <BubbleGirl />
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute',
              top: 24,
              right: 24,
              fontSize: 18,
              padding: '10px 32px',
              borderRadius: 8,
              background: '#fff',
              color: '#222',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0006',
              zIndex: 10,
            }}
          >
            Back to Menu
          </button>
        </div>
      );
    }
    return (
      <div
        style={{
          background: '#181818',
          minHeight: '100vh',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1 style={{ fontSize: 36, marginBottom: 16 }}>{game?.title}</h1>
        <p style={{ fontSize: 18, marginBottom: 32 }}>{game?.description}</p>
        <div style={{ width: 120, height: 120, marginBottom: 24 }}>
          <img
            src={game?.icon}
            alt={game?.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              borderRadius: 16,
              background: '#eee',
            }}
            onError={e => {
              (e.target as HTMLImageElement).src = '/images/games/placeholder.svg';
            }}
          />
        </div>
        <div style={{ fontSize: 22, marginBottom: 24 }}>
          <em>Game coming soon!</em>
        </div>
        <button
          onClick={() => setSelected(null)}
          style={{
            fontSize: 18,
            padding: '10px 32px',
            borderRadius: 8,
            background: '#fff',
            color: '#222',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #0006',
          }}
        >
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <>
      <GameCubeMenu games={games} onSelect={handleSelect} isAdult={isAdult} />
      {showNsfwModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: '#000a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: '#fff',
              color: '#222',
              borderRadius: 16,
              padding: 40,
              boxShadow: '0 4px 32px #0008',
              maxWidth: 400,
              textAlign: 'center',
            }}
          >
            <h2 style={{ fontSize: 28, marginBottom: 16 }}>18+ Only</h2>
            <p style={{ fontSize: 18, marginBottom: 24 }}>
              This game contains NSFW content. Are you 18 or older?
            </p>
            <button
              onClick={() => {
                setIsAdult(true);
                setShowNsfwModal(false);
              }}
              style={{
                fontSize: 18,
                padding: '10px 32px',
                borderRadius: 8,
                background: '#222',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                marginRight: 16,
              }}
            >
              Yes, I am 18+
            </button>
            <button
              onClick={() => setShowNsfwModal(false)}
              style={{
                fontSize: 18,
                padding: '10px 32px',
                borderRadius: 8,
                background: '#eee',
                color: '#222',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
