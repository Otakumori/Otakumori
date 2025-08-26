/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useCallback } from 'react';

export function useAudio(url: string) {
  const play = useCallback(() => {
    const audio = new Audio(url);
    audio.play();
  }, [url]);
  return { play };
}
