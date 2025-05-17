import { useState, useCallback, useEffect } from 'react';

interface Sound {
  id: string;
  src: string;
  volume?: number;
}

const SOUNDS: Record<string, Sound> = {
  achievement: {
    id: 'achievement',
    src: '/sounds/achievement.mp3',
    volume: 0.5,
  },
  petal: {
    id: 'petal',
    src: '/sounds/petal.mp3',
    volume: 0.3,
  },
  click: {
    id: 'click',
    src: '/sounds/click.mp3',
    volume: 0.2,
  },
  hover: {
    id: 'hover',
    src: '/sounds/hover.mp3',
    volume: 0.1,
  },
  gameStart: {
    id: 'gameStart',
    src: '/sounds/game-start.mp3',
    volume: 0.4,
  },
  gameComplete: {
    id: 'gameComplete',
    src: '/sounds/game-complete.mp3',
    volume: 0.6,
  },
};

export const useSound = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);

  useEffect(() => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(context);
    return () => {
      context.close().catch(() => {});
    };
  }, []);

  const playSound = useCallback(
    async (soundId: string) => {
      if (isMuted || !audioContext) return;

      const sound = SOUNDS[soundId];
      if (!sound) return;

      try {
        const response = await fetch(sound.src);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();

        source.buffer = audioBuffer;
        gainNode.gain.value = sound.volume || 1;

        source.connect(gainNode);
        gainNode.connect(audioContext.destination);

        source.start(0);
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    },
    [audioContext, isMuted]
  );

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return {
    playSound,
    toggleMute,
    isMuted,
  };
};
