'use client';

import { type ReactNode, useEffect } from 'react';
import SettingsConsole from './SettingsConsole.safe';
import { useSettings } from '../_contexts/SettingsCtx.safe';

interface DeciderProps {
  selectedGame?: string | null;
  children?: ReactNode;
}

export default function Decider({ selectedGame, children }: DeciderProps) {
  const { masterVolume, setMasterVolume, theme, setTheme } = useSettings();

  // Apply master volume to all audio elements in games
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((audio) => {
      audio.volume = masterVolume;
    });

    // Listen for new audio elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLAudioElement) {
            node.volume = masterVolume;
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [masterVolume]);

  // Apply theme to game container
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const gameContainer = document.querySelector('[data-game-container]');
    if (gameContainer) {
      gameContainer.setAttribute('data-theme', theme);
    }

    // Apply theme class to body for global styling
    document.body.setAttribute('data-game-theme', theme);

    return () => {
      document.body.removeAttribute('data-game-theme');
    };
  }, [theme]);

  // If no game is selected, show settings console
  if (!selectedGame) {
    return <SettingsConsole onVolumeChange={setMasterVolume} onThemeChange={setTheme} />;
  }

  // If a game is selected, render with settings applied
  return (
    <div
      data-game-container
      data-theme={theme}
      style={{ '--game-volume': masterVolume } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
