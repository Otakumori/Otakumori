// src/lib/hooks/useAudio.ts
'use client';

import { useCallback, useRef } from 'react';

interface UseAudioOptions {
  volume?: number;
  playbackRate?: number;
}

export function useAudio(src: string, options: UseAudioOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio(src);
        audioRef.current.volume = options.volume ?? 0.5;
        audioRef.current.playbackRate = options.playbackRate ?? 1.0;
      }
      
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.warn('Audio play failed:', error);
      });
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }, [src, options.volume, options.playbackRate]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  return {
    play,
    pause,
    stop,
  };
}


