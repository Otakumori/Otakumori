import React, { useState } from 'react';
import { useAchievements } from '@/lib/hooks/useAchievements';

export default function LoveLetterDuel() {
  const { unlockAchievement } = useAchievements();
  const [duels, setDuels] = useState(0);
  const [perfect, setPerfect] = useState(false);

  // Placeholder: Win a duel
  const handleWinDuel = () => {
    const newDuels = duels + 1;
    setDuels(newDuels);
    if (newDuels === 1) unlockAchievement('love_letter_firstlove');
    if (newDuels === 10) unlockAchievement('love_letter_heartbreaker');
  };

  // Placeholder: Compose perfect message
  const handlePerfectMessage = () => {
    setPerfect(true);
    unlockAchievement('love_letter_poet');
    unlockAchievement('love_letter_perfect');
  };

  // Placeholder: Use Jojo pose
  const handleJojoPose = () => {
    unlockAchievement('love_letter_jojo');
  };

  // Placeholder: NSFW mode
  const handleNSFW = () => {
    unlockAchievement('love_letter_nsfw');
  };

  // Placeholder: Speed duel
  const handleSpeedFlirt = () => {
    unlockAchievement('love_letter_speed');
  };

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
      <h1 style={{ fontSize: 36, marginBottom: 16 }}>Love Letter Duel</h1>
      <p style={{ fontSize: 18, marginBottom: 32 }}>
        Assemble poetic anime messages and compete for romance.
      </p>
      <div style={{ width: 120, height: 120, marginBottom: 24 }}>
        <img
          src="/images/games/love-letter-duel.png"
          alt="Love Letter Duel"
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
      {/* Demo achievement triggers */}
      <button onClick={handleWinDuel} style={{ margin: 4 }}>
        Win Duel
      </button>
      <button onClick={handlePerfectMessage} style={{ margin: 4 }}>
        Perfect Message
      </button>
      <button onClick={handleJojoPose} style={{ margin: 4 }}>
        Jojo Pose
      </button>
      <button onClick={handleNSFW} style={{ margin: 4 }}>
        NSFW Mode
      </button>
      <button onClick={handleSpeedFlirt} style={{ margin: 4 }}>
        Speed Flirt
      </button>
      <div style={{ marginTop: 12 }}>
        Duels: {duels} {perfect && <span>Perfect Message!</span>}
      </div>
    </div>
  );
}
