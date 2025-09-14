"use client";
import { useEffect, useState } from 'react';
import BootScreen from './_components/BootScreen';
import GameCubeHub from './_components/GameCubeHub';

export default function HubClient() {
  const [bootDone, setBootDone] = useState(false);
  useEffect(() => {
    try {
      const played = sessionStorage.getItem('om_boot_played') === '1';
      if (played) setBootDone(true);
    } catch {
      setBootDone(true);
    }
  }, []);

  if (!bootDone) return <BootScreen onDone={() => setBootDone(true)} />;
  return <GameCubeHub />;
}

