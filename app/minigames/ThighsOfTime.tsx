import React, { useState } from 'react';
import { useAchievements } from '@/lib/hooks/useAchievements';

export default function ThighsOfTime() {
  const { unlockAchievement } = useAchievements();
  const [combo, setCombo] = useState(0);
  const [songComplete, setSongComplete] = useState(false);
  const [characterUnlocked, setCharacterUnlocked] = useState(false);

  // Placeholder: Finish a song
  const handleFinishSong = () => {
    setSongComplete(true);
    unlockAchievement('thighs_time_initiate');
    unlockAchievement('thighs_time_rhythmgod'); // Assume perfect for demo
  };

  // Placeholder: Combo
  const handleCombo = () => {
    const newCombo = combo + 1;
    setCombo(newCombo);
    if (newCombo === 30) unlockAchievement('thighs_time_killlacombo');
    if (newCombo === 50) unlockAchievement('thighs_time_perfectchain');
  };

  // Placeholder: Unlock character
  const handleUnlockCharacter = () => {
    setCharacterUnlocked(true);
    unlockAchievement('thighs_time_waifu');
  };

  // Placeholder: Unlock NSFW
  const handleUnlockNSFW = () => {
    unlockAchievement('thighs_time_nsfw');
  };

  // Placeholder: Speed step
  const handleSpeedStep = () => {
    unlockAchievement('thighs_time_speed');
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
      <h1 style={{ fontSize: 36, marginBottom: 16 }}>Thighs of Time</h1>
      <p style={{ fontSize: 18, marginBottom: 32 }}>
        Rhythm game with dancing waifus/hunks and unlockable moves.
      </p>
      <div style={{ width: 120, height: 120, marginBottom: 24 }}>
        <img
          src="/images/games/thighs-of-time.png"
          alt="Thighs of Time"
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
      <button onClick={handleFinishSong} style={{ margin: 4 }}>
        Finish Song
      </button>
      <button onClick={handleCombo} style={{ margin: 4 }}>
        Combo
      </button>
      <button onClick={handleUnlockCharacter} style={{ margin: 4 }}>
        Unlock Character
      </button>
      <button onClick={handleUnlockNSFW} style={{ margin: 4 }}>
        Unlock NSFW Routine
      </button>
      <button onClick={handleSpeedStep} style={{ margin: 4 }}>
        Speed Step
      </button>
      <div style={{ marginTop: 12 }}>
        Combo: {combo} {songComplete && <span>Song Complete!</span>}{' '}
        {characterUnlocked && <span>Character Unlocked!</span>}
      </div>
    </div>
  );
}
