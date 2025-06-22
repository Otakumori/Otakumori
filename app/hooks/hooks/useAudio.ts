import { useState, useEffect, useRef, useCallback } from 'react';
import { useSoundSettings } from './useSoundSettings';

interface UseAudioProps {
  src: string;
  volume?: number;
  loop?: boolean;
}

export const useAudio = ({ src, volume = 1, loop = false }: UseAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const { volume: globalVolume, isMuted } = useSoundSettings();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio(src);
      audioRef.current.loop = loop;

      const handleCanPlayThrough = () => {
        setAudioLoaded(true);
      };

      audioRef.current.addEventListener('canplaythrough', handleCanPlayThrough);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplaythrough', handleCanPlayThrough);
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current = null;
        }
      };
    }
  }, [src, loop]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume * globalVolume;
    }
  }, [globalVolume, isMuted, volume]);

  const play = useCallback(() => {
    if (audioRef.current && audioLoaded && !isMuted) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      setIsPlaying(true);
    }
  }, [audioLoaded, isMuted]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const setVolume = useCallback(
    (newVolume: number) => {
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : newVolume * globalVolume;
      }
    },
    [globalVolume, isMuted]
  );

  return { isPlaying, play, pause, stop, setVolume, audioLoaded };
};
