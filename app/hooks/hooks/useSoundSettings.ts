 
 
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export const useSoundSettings = () => {
  const [volume, setVolume] = useLocalStorage('soundVolume', 0.5); // Default volume 50%
  const [isMuted, setIsMuted] = useLocalStorage('isSoundMuted', false);

  useEffect(() => {
    // Ensure volume is between 0 and 1
    setVolume((prevVolume) => Math.max(0, Math.min(1, prevVolume)));
  }, [setVolume]);

  const toggleMute = () => {
    setIsMuted((prevMuted) => !prevMuted);
  };

  return {
    volume,
    setVolume,
    isMuted,
    toggleMute,
  };
};
