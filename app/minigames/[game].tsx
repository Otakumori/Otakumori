'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { games } from './gamesConfig';
import PetalSamurai from './PetalSamurai';
import BrickBreaker from './BrickBreaker';
import PuzzleReveal from './PuzzleReveal';
import GlitchCrawl from './GlitchCrawl';
import ThighsOfTime from './ThighsOfTime';
import BentoBoss from './BentoBoss';
import LoveLetterDuel from './LoveLetterDuel';
import MaidMayhem from './MaidMayhem';
import OtakuDrift from './OtakuDrift';
import RuneAlchemy from './RuneAlchemy';

const components: Record<string, React.FC> = {
  'petal-samurai': PetalSamurai,
  'brick-breaker': BrickBreaker,
  'puzzle-reveal': PuzzleReveal,
  'glitch-crawl': GlitchCrawl,
  'thighs-of-time': ThighsOfTime,
  'bento-boss': BentoBoss,
  'love-letter-duel': LoveLetterDuel,
  'maid-mayhem': MaidMayhem,
  'otaku-drift': OtakuDrift,
  'rune-alchemy': RuneAlchemy,
  // Add more as implemented
};

export default function MiniGamePage({ params }: { params: { game: string } }) {
  const router = useRouter();
  const [isAdult, setIsAdult] = useState(false);
  const [showNsfwModal, setShowNsfwModal] = useState(false);
  const game = games.find(g => g.id === params.game);

  useEffect(() => {
    if (game?.nsfw && !isAdult) setShowNsfwModal(true);
  }, [game, isAdult]);

  if (!game) {
    return <div style={{ padding: 64, textAlign: 'center', fontSize: 28 }}>Game not found.</div>;
  }

  if (game.nsfw && !isAdult) {
    return showNsfwModal ? (
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
            onClick={() => router.push('/minigames')}
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
    ) : null;
  }

  const GameComponent = components[game.id];
  return GameComponent ? (
    <GameComponent />
  ) : (
    <div style={{ padding: 64, textAlign: 'center', fontSize: 28 }}>
      <h1>{game.title}</h1>
      <p>{game.description}</p>
      <div style={{ fontSize: 22, margin: '32px 0' }}>
        <em>Game coming soon!</em>
      </div>
      <button
        onClick={() => router.push('/minigames')}
        style={{
          fontSize: 18,
          padding: '10px 32px',
          borderRadius: 8,
          background: '#222',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Back to Menu
      </button>
    </div>
  );
}
