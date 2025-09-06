// DEPRECATED: This component is a duplicate. Use app\hooks\hooks\useAudio.ts instead.
import { useCallback } from 'react';

export function useAudio(url: string) {
  const play = useCallback(() => {
    const audio = new Audio(url);
    audio.play();
  }, [url]);
  return { play };
}
