'use client';
import { GameConfig } from './gamesConfig';

export default function GameCubeMenu({
  games,
  onSelect,
  isAdult,
}: {
  games: GameConfig[];
  onSelect: (id: string) => void;
  isAdult: boolean;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 32,
        padding: 32,
        background: '#222',
        minHeight: '100vh',
      }}
    >
      {games.map(game => {
        const locked = game.nsfw && !isAdult;
        return (
          <div
            key={game.id}
            style={{
              background: locked ? '#444' : '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 16px #0008',
              padding: 24,
              position: 'relative',
              cursor: locked ? 'not-allowed' : 'pointer',
              opacity: locked ? 0.6 : 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => !locked && onSelect(game.id)}
          >
            <div
              style={{
                width: 96,
                height: 96,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={game.icon}
                alt={game.title}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'contain',
                  borderRadius: 12,
                  background: '#eee',
                }}
                onError={e => {
                  (e.target as HTMLImageElement).src = '/images/games/placeholder.svg';
                }}
              />
            </div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 20,
                marginBottom: 8,
                color: locked ? '#bbb' : '#222',
              }}
            >
              {game.title}
            </div>
            <div style={{ fontSize: 15, color: locked ? '#aaa' : '#444' }}>{game.description}</div>
            {locked && (
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  background: '#c00',
                  color: '#fff',
                  borderRadius: 8,
                  padding: '2px 10px',
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: '0 1px 4px #0006',
                }}
              >
                18+ Locked
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
