import React, { useState } from 'react';
import { useAchievements } from '../lib/hooks/useAchievements';

export default function BentoBoss() {
  const { unlockAchievement } = useAchievements();
  const [customers, setCustomers] = useState(0);
  const [perfect, setPerfect] = useState(false);
  const [combo, setCombo] = useState(0);
  const [dayPerfect, setDayPerfect] = useState(false);

  // Placeholder: Serve a customer
  const handleServeCustomer = () => {
    const newCustomers = customers + 1;
    setCustomers(newCustomers);
    if (newCustomers === 1) unlockAchievement('bento_boss_beginner');
    if (newCustomers === 5) unlockAchievement('bento_boss_combo');
  };

  // Placeholder: Build perfect bento
  const handlePerfectBento = () => {
    setPerfect(true);
    unlockAchievement('bento_boss_aesthetic');
  };

  // Placeholder: Serve magical girl
  const handleSailorSnack = () => {
    unlockAchievement('bento_boss_sailorsnack');
  };

  // Placeholder: Speed service
  const handleSpeedService = () => {
    unlockAchievement('bento_boss_speed');
  };

  // Placeholder: NSFW ingredients
  const handleNSFW = () => {
    unlockAchievement('bento_boss_nsfw');
  };

  // Placeholder: Perfect day
  const handlePerfectDay = () => {
    setDayPerfect(true);
    unlockAchievement('bento_boss_perfectday');
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
      <h1 style={{ fontSize: 36, marginBottom: 16 }}>Bento Boss</h1>
      <p style={{ fontSize: 18, marginBottom: 32 }}>
        Stacking puzzle to build aesthetic bento boxes for anime customers.
      </p>
      <div style={{ width: 120, height: 120, marginBottom: 24 }}>
        <img
          src="/images/games/bento-boss.png"
          alt="Bento Boss"
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
      <button onClick={handleServeCustomer} style={{ margin: 4 }}>
        Serve Customer
      </button>
      <button onClick={handlePerfectBento} style={{ margin: 4 }}>
        Perfect Bento
      </button>
      <button onClick={handleSailorSnack} style={{ margin: 4 }}>
        Serve Magical Girl
      </button>
      <button onClick={handleSpeedService} style={{ margin: 4 }}>
        Speed Service
      </button>
      <button onClick={handleNSFW} style={{ margin: 4 }}>
        NSFW Ingredients
      </button>
      <button onClick={handlePerfectDay} style={{ margin: 4 }}>
        Perfect Day
      </button>
      <div style={{ marginTop: 12 }}>
        Customers: {customers} {perfect && <span>Perfect Bento!</span>}{' '}
        {combo > 0 && <span>Combo: {combo}</span>} {dayPerfect && <span>Perfect Day!</span>}
      </div>
    </div>
  );
}
