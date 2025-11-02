/**
 * Audio Store - Global Audio State Management
 * Manages sound pools, spatial audio, and adaptive music layers
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SoundCategory = 'sfx' | 'music' | 'ui' | 'voice' | 'ambient';
export type SoundPool = 'game' | 'menu' | 'combat' | 'social';

export interface Sound {
  id: string;
  name: string;
  url: string;
  category: SoundCategory;
  pool: SoundPool;
  volume: number;
  loop: boolean;
  spatial: boolean;
  preload: boolean;
}

export interface AudioSettings {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  uiVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  muted: boolean;
  spatialAudioEnabled: boolean;
  adaptiveMusicEnabled: boolean;
}

export interface PlayingSound {
  id: string;
  soundId: string;
  audioNode: AudioBufferSourceNode | null;
  gainNode: GainNode | null;
  pannerNode: PannerNode | null;
  startTime: number;
  loop: boolean;
}

interface AudioStore {
  // Audio Context
  audioContext: AudioContext | null;
  masterGainNode: GainNode | null;

  // Settings
  settings: AudioSettings;

  // Sound Library
  sounds: Record<string, Sound>;
  loadedBuffers: Record<string, AudioBuffer>;

  // Currently Playing
  playingSounds: Record<string, PlayingSound>;

  // Music Layers
  musicLayers: {
    base: string | null;
    melody: string | null;
    drums: string | null;
    ambient: string | null;
  };

  // Actions
  initAudioContext: () => void;
  registerSound: (sound: Sound) => void;
  loadSound: (soundId: string) => Promise<void>;
  playSound: (
    soundId: string,
    options?: { volume?: number; loop?: boolean; position?: [number, number, number] },
  ) => string;
  stopSound: (playingId: string) => void;
  stopAllSounds: () => void;
  updateVolume: (category: SoundCategory | 'master', volume: number) => void;
  toggleMute: () => void;
  setMusicLayer: (layer: keyof AudioStore['musicLayers'], soundId: string | null) => void;
  updateSpatialPosition: (playingId: string, position: [number, number, number]) => void;
}

const DEFAULT_SETTINGS: AudioSettings = {
  masterVolume: 0.7,
  sfxVolume: 0.8,
  musicVolume: 0.6,
  uiVolume: 0.5,
  voiceVolume: 1.0,
  ambientVolume: 0.4,
  muted: false,
  spatialAudioEnabled: true,
  adaptiveMusicEnabled: true,
};

export const useAudioStore = create<AudioStore>()(
  persist(
    (set, get) => ({
      audioContext: null,
      masterGainNode: null,
      settings: DEFAULT_SETTINGS,
      sounds: {},
      loadedBuffers: {},
      playingSounds: {},
      musicLayers: {
        base: null,
        melody: null,
        drums: null,
        ambient: null,
      },

      initAudioContext: () => {
        if (typeof window === 'undefined') return;

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const masterGain = ctx.createGain();
        masterGain.connect(ctx.destination);
        masterGain.gain.value = get().settings.masterVolume;

        set({ audioContext: ctx, masterGainNode: masterGain });
      },

      registerSound: (sound) =>
        set((state) => ({
          sounds: { ...state.sounds, [sound.id]: sound },
        })),

      loadSound: async (soundId) => {
        const { sounds, loadedBuffers, audioContext } = get();
        const sound = sounds[soundId];

        if (!sound || !audioContext || loadedBuffers[soundId]) return;

        try {
          const response = await fetch(sound.url);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          set((state) => ({
            loadedBuffers: { ...state.loadedBuffers, [soundId]: audioBuffer },
          }));
        } catch (error) {
          console.error(`Failed to load sound ${soundId}:`, error);
        }
      },

      playSound: (soundId, options = {}) => {
        const { sounds, loadedBuffers, audioContext, masterGainNode, settings } = get();
        const sound = sounds[soundId];

        if (!sound || !audioContext || !masterGainNode) {
          return '';
        }

        // Load if not loaded
        if (!loadedBuffers[soundId]) {
          get().loadSound(soundId);
          return '';
        }

        const playingId = `${soundId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const buffer = loadedBuffers[soundId];

        // Create audio nodes
        const source = audioContext.createBufferSource();
        source.buffer = buffer;

        const gainNode = audioContext.createGain();
        const categoryVolume = settings[`${sound.category}Volume` as keyof AudioSettings] as number;
        const soundVolume = options.volume ?? sound.volume;
        gainNode.gain.value = categoryVolume * soundVolume;

        let pannerNode: PannerNode | null = null;

        if (sound.spatial && settings.spatialAudioEnabled && options.position) {
          pannerNode = audioContext.createPanner();
          pannerNode.panningModel = 'HRTF';
          pannerNode.distanceModel = 'inverse';
          pannerNode.refDistance = 1;
          pannerNode.maxDistance = 10;
          pannerNode.rolloffFactor = 1;
          pannerNode.coneInnerAngle = 360;
          pannerNode.coneOuterAngle = 0;
          pannerNode.coneOuterGain = 0;

          const [x, y, z] = options.position;
          pannerNode.setPosition(x, y, z);

          source.connect(gainNode);
          gainNode.connect(pannerNode);
          pannerNode.connect(masterGainNode);
        } else {
          source.connect(gainNode);
          gainNode.connect(masterGainNode);
        }

        const loop = options.loop ?? sound.loop;
        source.loop = loop;
        source.start(0);

        const playingSound: PlayingSound = {
          id: playingId,
          soundId,
          audioNode: source,
          gainNode,
          pannerNode,
          startTime: audioContext.currentTime,
          loop,
        };

        set((state) => ({
          playingSounds: { ...state.playingSounds, [playingId]: playingSound },
        }));

        // Auto-cleanup when sound ends
        if (!loop) {
          source.onended = () => {
            set((state) => {
              const { [playingId]: _, ...rest } = state.playingSounds;
              return { playingSounds: rest };
            });
          };
        }

        return playingId;
      },

      stopSound: (playingId) => {
        const { playingSounds } = get();
        const playing = playingSounds[playingId];

        if (playing && playing.audioNode) {
          playing.audioNode.stop();
          set((state) => {
            const { [playingId]: _, ...rest } = state.playingSounds;
            return { playingSounds: rest };
          });
        }
      },

      stopAllSounds: () => {
        const { playingSounds } = get();

        Object.values(playingSounds).forEach((playing) => {
          if (playing.audioNode) {
            playing.audioNode.stop();
          }
        });

        set({ playingSounds: {} });
      },

      updateVolume: (category, volume) => {
        const { masterGainNode, playingSounds } = get();

        if (category === 'master' && masterGainNode) {
          masterGainNode.gain.value = volume;
          set((state) => ({
            settings: { ...state.settings, masterVolume: volume },
          }));
        } else {
          set((state) => ({
            settings: { ...state.settings, [`${category}Volume`]: volume },
          }));

          // Update all playing sounds of this category
          Object.values(playingSounds).forEach((playing) => {
            const sound = get().sounds[playing.soundId];
            if (sound && sound.category === category && playing.gainNode) {
              playing.gainNode.gain.value = volume * sound.volume;
            }
          });
        }
      },

      toggleMute: () => {
        const { masterGainNode, settings } = get();

        if (masterGainNode) {
          const newMuted = !settings.muted;
          masterGainNode.gain.value = newMuted ? 0 : settings.masterVolume;

          set((state) => ({
            settings: { ...state.settings, muted: newMuted },
          }));
        }
      },

      setMusicLayer: (layer, soundId) => {
        const { musicLayers } = get();
        const previousSoundId = musicLayers[layer];

        // Stop previous layer if exists
        if (previousSoundId) {
          const playingIds = Object.keys(get().playingSounds).filter(
            (id) => get().playingSounds[id].soundId === previousSoundId,
          );
          playingIds.forEach((id) => get().stopSound(id));
        }

        // Play new layer
        if (soundId) {
          get().playSound(soundId, { loop: true });
        }

        set((state) => ({
          musicLayers: { ...state.musicLayers, [layer]: soundId },
        }));
      },

      updateSpatialPosition: (playingId, position) => {
        const { playingSounds } = get();
        const playing = playingSounds[playingId];

        if (playing && playing.pannerNode) {
          const [x, y, z] = position;
          playing.pannerNode.setPosition(x, y, z);
        }
      },
    }),
    {
      name: 'otakumori-audio-storage',
      partialize: (state) => ({
        settings: state.settings,
      }),
    },
  ),
);
