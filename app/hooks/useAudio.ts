/**
 * Audio Hooks
 * React hooks for easy audio integration
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useAudioStore } from '@/app/stores/audioStore';

/**
 * Initialize audio context on user interaction
 */
export function useAudioInit() {
  const { audioContext, initAudioContext } = useAudioStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || initialized.current || audioContext) return;

    const initOnInteraction = () => {
      if (!initialized.current) {
        initAudioContext();
        initialized.current = true;

        // Remove listeners after first interaction
        window.removeEventListener('click', initOnInteraction);
        window.removeEventListener('keydown', initOnInteraction);
        window.removeEventListener('touchstart', initOnInteraction);
      }
    };

    window.addEventListener('click', initOnInteraction);
    window.addEventListener('keydown', initOnInteraction);
    window.addEventListener('touchstart', initOnInteraction);

    return () => {
      window.removeEventListener('click', initOnInteraction);
      window.removeEventListener('keydown', initOnInteraction);
      window.removeEventListener('touchstart', initOnInteraction);
    };
  }, [audioContext, initAudioContext]);

  return { audioContext, isInitialized: !!audioContext };
}

/**
 * Play a sound effect
 */
export function useSoundEffect(soundId: string) {
  const { playSound, stopSound, loadSound } = useAudioStore();
  const playingIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Preload sound
    loadSound(soundId);
  }, [soundId, loadSound]);

  const play = useCallback(
    (options?: { volume?: number; loop?: boolean }) => {
      // Stop previous if still playing
      if (playingIdRef.current) {
        stopSound(playingIdRef.current);
      }

      playingIdRef.current = playSound(soundId, options);
      return playingIdRef.current;
    },
    [soundId, playSound, stopSound],
  );

  const stop = useCallback(() => {
    if (playingIdRef.current) {
      stopSound(playingIdRef.current);
      playingIdRef.current = null;
    }
  }, [stopSound]);

  return { play, stop };
}

/**
 * Play spatial audio at a position
 */
export function useSpatialAudio(soundId: string) {
  const { playSound, stopSound, updateSpatialPosition, loadSound } = useAudioStore();
  const playingIdRef = useRef<string | null>(null);

  useEffect(() => {
    loadSound(soundId);
  }, [soundId, loadSound]);

  const play = useCallback(
    (position: [number, number, number], options?: { volume?: number; loop?: boolean }) => {
      if (playingIdRef.current) {
        stopSound(playingIdRef.current);
      }

      playingIdRef.current = playSound(soundId, { ...options, position });
      return playingIdRef.current;
    },
    [soundId, playSound, stopSound],
  );

  const updatePosition = useCallback(
    (position: [number, number, number]) => {
      if (playingIdRef.current) {
        updateSpatialPosition(playingIdRef.current, position);
      }
    },
    [updateSpatialPosition],
  );

  const stop = useCallback(() => {
    if (playingIdRef.current) {
      stopSound(playingIdRef.current);
      playingIdRef.current = null;
    }
  }, [stopSound]);

  useEffect(() => {
    return () => {
      if (playingIdRef.current) {
        stopSound(playingIdRef.current);
      }
    };
  }, [stopSound]);

  return { play, stop, updatePosition };
}

/**
 * Background music with layers
 */
export function useBackgroundMusic(layerSounds: {
  base?: string;
  melody?: string;
  drums?: string;
  ambient?: string;
}) {
  const { setMusicLayer, musicLayers } = useAudioStore();

  useEffect(() => {
    // Set music layers
    if (layerSounds.base) setMusicLayer('base', layerSounds.base);
    if (layerSounds.melody) setMusicLayer('melody', layerSounds.melody);
    if (layerSounds.drums) setMusicLayer('drums', layerSounds.drums);
    if (layerSounds.ambient) setMusicLayer('ambient', layerSounds.ambient);

    return () => {
      // Cleanup on unmount
      setMusicLayer('base', null);
      setMusicLayer('melody', null);
      setMusicLayer('drums', null);
      setMusicLayer('ambient', null);
    };
  }, [layerSounds.base, layerSounds.melody, layerSounds.drums, layerSounds.ambient, setMusicLayer]);

  return { activeLayers: musicLayers };
}

/**
 * UI sound effects (button clicks, hovers, etc.)
 */
export function useUISound() {
  const { playSound, registerSound } = useAudioStore();

  useEffect(() => {
    // Register default UI sounds
    registerSound({
      id: 'ui-click',
      name: 'Click',
      url: '/sounds/ui/click.mp3',
      category: 'ui',
      pool: 'menu',
      volume: 0.5,
      loop: false,
      spatial: false,
      preload: true,
    });

    registerSound({
      id: 'ui-hover',
      name: 'Hover',
      url: '/sounds/ui/hover.mp3',
      category: 'ui',
      pool: 'menu',
      volume: 0.3,
      loop: false,
      spatial: false,
      preload: true,
    });

    registerSound({
      id: 'ui-success',
      name: 'Success',
      url: '/sounds/ui/success.mp3',
      category: 'ui',
      pool: 'menu',
      volume: 0.6,
      loop: false,
      spatial: false,
      preload: true,
    });

    registerSound({
      id: 'ui-error',
      name: 'Error',
      url: '/sounds/ui/error.mp3',
      category: 'ui',
      pool: 'menu',
      volume: 0.6,
      loop: false,
      spatial: false,
      preload: true,
    });
  }, [registerSound]);

  const playClick = useCallback(() => playSound('ui-click'), [playSound]);
  const playHover = useCallback(() => playSound('ui-hover'), [playSound]);
  const playSuccess = useCallback(() => playSound('ui-success'), [playSound]);
  const playError = useCallback(() => playSound('ui-error'), [playSound]);

  return { playClick, playHover, playSuccess, playError };
}

/**
 * Audio volume controls
 */
export function useAudioControls() {
  const { settings, updateVolume, toggleMute } = useAudioStore();

  const setMasterVolume = useCallback(
    (volume: number) => updateVolume('master', volume),
    [updateVolume],
  );

  const setSFXVolume = useCallback((volume: number) => updateVolume('sfx', volume), [updateVolume]);

  const setMusicVolume = useCallback(
    (volume: number) => updateVolume('music', volume),
    [updateVolume],
  );

  const setUIVolume = useCallback((volume: number) => updateVolume('ui', volume), [updateVolume]);

  return {
    settings,
    setMasterVolume,
    setSFXVolume,
    setMusicVolume,
    setUIVolume,
    toggleMute,
  };
}
