// DEPRECATED: This component is a duplicate. Use components\SoundSettings.tsx instead.

'use client';

import { logger } from '@/app/lib/logger';
import React, { useState, useEffect } from 'react';

interface SoundSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  voiceEnabled: boolean;
}

export const SoundSettings: React.FC = () => {
  const [settings, setSettings] = useState<SoundSettings>({
    masterVolume: 70,
    musicVolume: 60,
    sfxVolume: 80,
    voiceVolume: 75,
    musicEnabled: true,
    sfxEnabled: true,
    voiceEnabled: true,
  });

  const [isOpen, setIsOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('soundSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        logger.error('Failed to parse sound settings:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
      }
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('soundSettings', JSON.stringify(settings));

    // Apply settings to any existing audio elements
    applySoundSettings();
  }, [settings]);

  const applySoundSettings = () => {
    // Apply master volume to all audio elements
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((audio) => {
      const category = audio.dataset.soundCategory || 'sfx';
      let volume = settings.masterVolume / 100;

      switch (category) {
        case 'music':
          volume *= (settings.musicVolume / 100) * (settings.musicEnabled ? 1 : 0);
          break;
        case 'sfx':
          volume *= (settings.sfxVolume / 100) * (settings.sfxEnabled ? 1 : 0);
          break;
        case 'voice':
          volume *= (settings.voiceVolume / 100) * (settings.voiceEnabled ? 1 : 0);
          break;
      }

      audio.volume = volume;
    });
  };

  const handleVolumeChange = (category: keyof SoundSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [category]: value }));
  };

  const handleToggle = (category: keyof SoundSettings) => {
    setSettings((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const playTestSound = (category: 'music' | 'sfx' | 'voice') => {
    const audio = new Audio();
    audio.dataset.soundCategory = category;

    // Set test sounds based on category
    switch (category) {
      case 'music':
        audio.src = '/sounds/gamecube-startup.mp3';
        break;
      case 'sfx':
        audio.src = '/sounds/achievement-unlock.mp3';
        break;
      case 'voice':
        audio.src = '/sounds/404-error.mp3';
        break;
    }

    // Apply current settings
    let volume = settings.masterVolume / 100;
    switch (category) {
      case 'music':
        volume *= (settings.musicVolume / 100) * (settings.musicEnabled ? 1 : 0);
        break;
      case 'sfx':
        volume *= (settings.sfxVolume / 100) * (settings.sfxEnabled ? 1 : 0);
        break;
      case 'voice':
        volume *= (settings.voiceVolume / 100) * (settings.voiceEnabled ? 1 : 0);
        break;
    }

    audio.volume = volume;
    audio.play().catch((error) => {
      logger.error('Failed to play test sound:', undefined, undefined, error instanceof Error ? error : new Error(String(error)));
    });
  };

  const resetToDefaults = () => {
    const defaults: SoundSettings = {
      masterVolume: 70,
      musicVolume: 60,
      sfxVolume: 80,
      voiceVolume: 75,
      musicEnabled: true,
      sfxEnabled: true,
      voiceEnabled: true,
    };
    setSettings(defaults);
  };

  return (
    <div className="sound-settings-container">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="sound-settings-toggle"
        style={{
          background: '#FF69B4',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        Sound Settings
        <span style={{ fontSize: '12px' }}>{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <div
          className="sound-settings-panel"
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            background: '#333',
            border: '2px solid #FF69B4',
            borderRadius: '8px',
            padding: '20px',
            minWidth: '300px',
            zIndex: 1000,
            marginTop: '8px',
          }}
        >
          <h3 style={{ color: '#fff', marginBottom: '20px', fontSize: '18px' }}>Audio Controls</h3>

          {/* Master Volume */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>
              Master Volume: {settings.masterVolume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.masterVolume}
              onChange={(e) => handleVolumeChange('masterVolume', parseInt(e.target.value))}
              style={{ width: '100%' }}
              aria-label="Master volume"
            />
          </div>

          {/* Music Settings */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label style={{ color: '#fff' }}>Music: {settings.musicVolume}%</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={settings.musicEnabled}
                  onChange={() => handleToggle('musicEnabled')}
                  aria-label="Enable music"
                />
                <button
                  onClick={() => playTestSound('music')}
                  style={{
                    background: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Test
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.musicVolume}
              onChange={(e) => handleVolumeChange('musicVolume', parseInt(e.target.value))}
              style={{ width: '100%' }}
              aria-label="Music volume"
            />
          </div>

          {/* SFX Settings */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label style={{ color: '#fff' }}>Sound Effects: {settings.sfxVolume}%</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={settings.sfxEnabled}
                  onChange={() => handleToggle('sfxEnabled')}
                  aria-label="Enable sound effects"
                />
                <button
                  onClick={() => playTestSound('sfx')}
                  style={{
                    background: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Test
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.sfxVolume}
              onChange={(e) => handleVolumeChange('sfxVolume', parseInt(e.target.value))}
              style={{ width: '100%' }}
              aria-label="Sound effects volume"
            />
          </div>

          {/* Voice Settings */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <label style={{ color: '#fff' }}>Voice: {settings.voiceVolume}%</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={settings.voiceEnabled}
                  onChange={() => handleToggle('voiceEnabled')}
                  aria-label="Enable voice"
                />
                <button
                  onClick={() => playTestSound('voice')}
                  style={{
                    background: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  Test
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.voiceVolume}
              onChange={(e) => handleVolumeChange('voiceVolume', parseInt(e.target.value))}
              style={{ width: '100%' }}
              aria-label="Voice volume"
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            <button
              onClick={resetToDefaults}
              style={{
                background: '#FF9800',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Reset to Defaults
            </button>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
