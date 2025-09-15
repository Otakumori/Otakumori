'use client';
import { useEffect, useState } from 'react';
import BootScreen from './_components/BootScreen';
import GameCubeHub from './_components/GameCubeHub';

export default function HubClient() {
  const [bootDone, setBootDone] = useState(false);
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const last = localStorage.getItem('om_boot_day');
      if (last === today) setBootDone(true);
    } catch {
      setBootDone(true);
    }
  }, []);

  if (!bootDone)
    return (
      <BootScreen
        onDone={() => {
          try {
            localStorage.setItem('om_boot_day', new Date().toISOString().slice(0, 10));
          } catch {}
          setBootDone(true);
        }}
      />
    );
  return <GameCubeHub />;
}
