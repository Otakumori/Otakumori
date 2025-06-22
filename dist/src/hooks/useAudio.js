'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.useAudio = void 0;
const react_1 = require('react');
const useSoundSettings_1 = require('./useSoundSettings');
const useAudio = ({ src, volume = 1, loop = false }) => {
  const audioRef = (0, react_1.useRef)(null);
  const [isPlaying, setIsPlaying] = (0, react_1.useState)(false);
  const [audioLoaded, setAudioLoaded] = (0, react_1.useState)(false);
  const { volume: globalVolume, isMuted } = (0, useSoundSettings_1.useSoundSettings)();
  (0, react_1.useEffect)(() => {
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
  (0, react_1.useEffect)(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume * globalVolume;
    }
  }, [globalVolume, isMuted, volume]);
  const play = (0, react_1.useCallback)(() => {
    if (audioRef.current && audioLoaded && !isMuted) {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
      setIsPlaying(true);
    }
  }, [audioLoaded, isMuted]);
  const pause = (0, react_1.useCallback)(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);
  const stop = (0, react_1.useCallback)(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);
  const setVolume = (0, react_1.useCallback)(
    newVolume => {
      if (audioRef.current) {
        audioRef.current.volume = isMuted ? 0 : newVolume * globalVolume;
      }
    },
    [globalVolume, isMuted]
  );
  return { isPlaying, play, pause, stop, setVolume, audioLoaded };
};
exports.useAudio = useAudio;
