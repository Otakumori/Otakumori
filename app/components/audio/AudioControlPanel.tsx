/**
 * Audio Control Panel
 * Visual controls for audio settings
 */

'use client';

import React from 'react';
import { Volume2, VolumeX, Music, Mic, Zap } from 'lucide-react';
import { useAudioControls, useAudioInit } from '@/app/hooks/useAudio';
import { motion } from 'framer-motion';

interface VolumeSliderProps {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  value: number;
  onChange: (value: number) => void;
  color?: string;
}

function VolumeSlider({ label, icon: Icon, value, onChange, color = 'pink' }: VolumeSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-white/70" />
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <span className="text-xs text-white/50">{Math.round(value * 100)}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, var(--${color}-500) 0%, var(--${color}-500) ${value * 100}%, rgba(255,255,255,0.1) ${value * 100}%, rgba(255,255,255,0.1) 100%)`,
          }}
        />
      </div>
    </div>
  );
}

export default function AudioControlPanel() {
  const { isInitialized } = useAudioInit();
  const { settings, setMasterVolume, setSFXVolume, setMusicVolume, setUIVolume, toggleMute } =
    useAudioControls();

  if (!isInitialized) {
    return (
      <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-lg">
        <p className="text-center text-sm text-white/70">
          Click anywhere to initialize audio system
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/20 bg-white/5 p-6 backdrop-blur-lg"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Audio Controls</h3>
        <button
          onClick={toggleMute}
          className={`rounded-lg p-2 transition-colors ${
            settings.muted
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
          aria-label={settings.muted ? 'Unmute' : 'Mute'}
        >
          {settings.muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Volume Sliders */}
      <div className="space-y-6">
        <VolumeSlider
          label="Master Volume"
          icon={Volume2}
          value={settings.masterVolume}
          onChange={setMasterVolume}
          color="purple"
        />

        <VolumeSlider
          label="Music"
          icon={Music}
          value={settings.musicVolume}
          onChange={setMusicVolume}
          color="pink"
        />

        <VolumeSlider
          label="Sound Effects"
          icon={Zap}
          value={settings.sfxVolume}
          onChange={setSFXVolume}
          color="blue"
        />

        <VolumeSlider
          label="UI Sounds"
          icon={Mic}
          value={settings.uiVolume}
          onChange={setUIVolume}
          color="green"
        />
      </div>

      {/* Advanced Settings */}
      <div className="mt-6 space-y-3 border-t border-white/10 pt-6">
        <label className="flex items-center justify-between">
          <span className="text-sm text-white">Spatial Audio</span>
          <input
            type="checkbox"
            checked={settings.spatialAudioEnabled}
            className="h-5 w-5 rounded"
            readOnly
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm text-white">Adaptive Music</span>
          <input
            type="checkbox"
            checked={settings.adaptiveMusicEnabled}
            className="h-5 w-5 rounded"
            readOnly
          />
        </label>
      </div>

      {/* Audio Status */}
      <div className="mt-4 rounded-lg bg-white/5 p-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${settings.muted ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}
          />
          <span className="text-xs text-white/70">
            {settings.muted ? 'Audio Muted' : 'Audio Active'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
