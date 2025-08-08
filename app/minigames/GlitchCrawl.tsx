import React, { useState } from 'react';
import { useAchievements } from '@/lib/hooks/useAchievements';

export default function GlitchCrawl() {
  const { unlockAchievement } = useAchievements();
  const [shards, setShards] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);

  // Placeholder: Collect a shard
  const handleCollectShard = () => {
    const newShards = shards + 1;
    setShards(newShards);
    if (newShards === 1) unlockAchievement('glitch_crawl_datadiver');
    if (newShards === 50) unlockAchievement('glitch_crawl_fragments');
  };

  // Placeholder: Complete a level
  const handleCompleteLevel = () => {
    setLevelComplete(true);
    unlockAchievement('glitch_crawl_runner');
    unlockAchievement('glitch_crawl_speed'); // Assume speed for demo
  };

  // Placeholder: Find error room
  const handleFindErrorRoom = () => {
    unlockAchievement('glitch_crawl_404');
  };

  // Placeholder: Use mind-bending power-up
  const handlePsyOps = () => {
    unlockAchievement('glitch_crawl_psyops');
  };

  // Placeholder: Unlock NSFW world
  const handleUnlockNSFW = () => {
    unlockAchievement('glitch_crawl_nsfw');
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
      <h1 style={{ fontSize: 36, marginBottom: 16 }}>Glitch Crawl</h1>
      <p style={{ fontSize: 18, marginBottom: 32 }}>
        Platformer through a glitched data world. Collect shards and decrypt files.
      </p>
      <div style={{ width: 120, height: 120, marginBottom: 24 }}>
        <img
          src="/images/games/glitch-crawl.png"
          alt="Glitch Crawl"
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
      <button onClick={handleCollectShard} style={{ margin: 4 }}>
        Collect Shard
      </button>
      <button onClick={handleCompleteLevel} style={{ margin: 4 }}>
        Complete Level
      </button>
      <button onClick={handleFindErrorRoom} style={{ margin: 4 }}>
        Find Error Room
      </button>
      <button onClick={handlePsyOps} style={{ margin: 4 }}>
        Use Psy-ops Power-up
      </button>
      <button onClick={handleUnlockNSFW} style={{ margin: 4 }}>
        Unlock NSFW World
      </button>
      <div style={{ marginTop: 12 }}>
        Shards: {shards} {levelComplete && <span>Level Complete!</span>}
      </div>
    </div>
  );
}
