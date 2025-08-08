import React, { useState } from 'react';
import { useAchievements } from '@/lib/hooks/useAchievements';

export default function MaidMayhem() {
  const { unlockAchievement } = useAchievements();
  const [rushSurvived, setRushSurvived] = useState(false);
  const [perfectDay, setPerfectDay] = useState(false);

  // Placeholder: Survive rush
  const handleSurviveRush = () => {
    setRushSurvived(true);
    unlockAchievement('maid_mayhem_training');
  };

  // Placeholder: Perfect day
  const handlePerfectDay = () => {
    setPerfectDay(true);
    unlockAchievement('maid_mayhem_butlerboss');
    unlockAchievement('maid_mayhem_perfect');
  };

  // Placeholder: Chaos event
  const handleChaos = () => {
    unlockAchievement('maid_mayhem_flustered');
  };

  // Placeholder: Magical mess
  const handleWitchblade = () => {
    unlockAchievement('maid_mayhem_witchblade');
  };

  // Placeholder: NSFW mode
  const handleNSFW = () => {
    unlockAchievement('maid_mayhem_nsfw');
  };

  // Placeholder: Speed server
  const handleSpeed = () => {
    unlockAchievement('maid_mayhem_speed');
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
      <h1 style={{ fontSize: 36, marginBottom: 16 }}>Maid Mayhem</h1>
      <p style={{ fontSize: 18, marginBottom: 32 }}>
        Time management chaos in a flustered maid/butler cafe.
      </p>
      <div style={{ width: 120, height: 120, marginBottom: 24 }}>
        <img
          src="/images/games/maid-mayhem.png"
          alt="Maid Mayhem"
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
      <button onClick={handleSurviveRush} style={{ margin: 4 }}>
        Survive Rush
      </button>
      <button onClick={handlePerfectDay} style={{ margin: 4 }}>
        Perfect Day
      </button>
      <button onClick={handleChaos} style={{ margin: 4 }}>
        Chaos Event
      </button>
      <button onClick={handleWitchblade} style={{ margin: 4 }}>
        Magical Mess
      </button>
      <button onClick={handleNSFW} style={{ margin: 4 }}>
        NSFW Mode
      </button>
      <button onClick={handleSpeed} style={{ margin: 4 }}>
        Speed Server
      </button>
      <div style={{ marginTop: 12 }}>
        {rushSurvived && <span>Rush Survived!</span>} {perfectDay && <span>Perfect Day!</span>}
      </div>
    </div>
  );
}
