'use client';

import { type ReactNode } from 'react';
import SettingsConsole from './SettingsConsole.safe';
import { useSettings } from '../_contexts/SettingsCtx.safe';

interface DeciderProps {
  selectedGame?: string | null;
  children?: ReactNode;
}

export default function Decider({ selectedGame, children }: DeciderProps) {
  const { masterVolume, setMasterVolume, theme, setTheme } = useSettings();

  // If no game is selected, show settings console
  if (!selectedGame) {
    return <SettingsConsole onVolumeChange={setMasterVolume} onThemeChange={setTheme} />;
  }

  // If a game is selected, render the children (game content)
  return <>{children}</>;
}
