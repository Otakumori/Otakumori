 
 
import { useCallback } from 'react';

export function useSound(url?: string) {
  const play = useCallback(() => {
    if (url) {
      const audio = new Audio(url);
      audio.play();
    }
  }, [url]);

  const playSound = useCallback((soundUrl: string) => {
    const audio = new Audio(soundUrl);
    audio.play();
  }, []);

  return { play, playSound };
}
