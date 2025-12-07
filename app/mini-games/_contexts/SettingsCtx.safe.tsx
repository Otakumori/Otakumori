'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface SettingsContextType {
  masterVolume: number;
  isMuted: boolean;
  theme: 'dark' | 'light';
  setMasterVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  resetSettings: () => void;
  }

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [masterVolume, setMasterVolumeState] = useState(0.7);
  const [isMuted, setIsMutedState] = useState(false);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedVolume = localStorage.getItem('otm-master-volume');
      const savedMuted = localStorage.getItem('otm-muted');
      const savedTheme = localStorage.getItem('otm-theme');

      if (savedVolume !== null) {
        setMasterVolumeState(parseFloat(savedVolume));
      }
      if (savedMuted !== null) {
        setIsMutedState(savedMuted === 'true');
      }
      if (savedTheme !== null && (savedTheme === 'dark' || savedTheme === 'light')) {
        setThemeState(savedTheme);
      }
    } catch {
      // Failed to load settings from localStorage
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('otm-master-volume', masterVolume.toString());
    } catch {
      // Failed to save volume to localStorage
    }
  }, [masterVolume]);

  useEffect(() => {
    try {
      localStorage.setItem('otm-muted', isMuted.toString());
    } catch {
      // Failed to save muted state to localStorage
    }
  }, [isMuted]);

  useEffect(() => {
    try {
      localStorage.setItem('otm-theme', theme);
    } catch {
      // Failed to save theme to localStorage
    }
  }, [theme]);

  const setMasterVolume = (volume: number) => {
    setMasterVolumeState(Math.max(0, Math.min(1, volume)));
  };

  const setMuted = (muted: boolean) => {
    setIsMutedState(muted);
  };

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
  };

  const resetSettings = () => {
    setMasterVolumeState(0.7);
    setIsMutedState(false);
    setThemeState('dark');
  };

  const value: SettingsContextType = {
    masterVolume,
    isMuted,
    theme,
    setMasterVolume,
    setMuted,
    setTheme,
    resetSettings,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
