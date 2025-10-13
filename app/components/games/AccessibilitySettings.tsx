'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: GameAccessibilitySettings) => void;
  initialSettings?: GameAccessibilitySettings;
}

export interface GameAccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  captions: boolean;
  volume: number;
  inputMethod: 'keyboard' | 'gamepad' | 'touch';
  fontSize: 'small' | 'medium' | 'large';
  colorBlindSupport: boolean;
  audioDescriptions: boolean;
}

const defaultSettings: GameAccessibilitySettings = {
  reducedMotion: false,
  highContrast: false,
  captions: false,
  volume: 0.8,
  inputMethod: 'keyboard',
  fontSize: 'medium',
  colorBlindSupport: false,
  audioDescriptions: false,
};

export default function AccessibilitySettings({
  isOpen,
  onClose,
  onSettingsChange,
  initialSettings = defaultSettings,
}: AccessibilitySettingsProps) {
  const [settings, setSettings] = useState<GameAccessibilitySettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check for system preferences
    if (typeof window !== 'undefined') {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

      setSettings((prev) => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }));
    }
  }, []);

  const updateSetting = <K extends keyof GameAccessibilitySettings>(
    key: K,
    value: GameAccessibilitySettings[K],
  ) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      setHasChanges(true);
      return newSettings;
    });
  };

  const handleSave = () => {
    onSettingsChange(settings);
    setHasChanges(false);

    // Save to localStorage
    try {
      localStorage.setItem('otm-game-accessibility', JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save accessibility settings:', error);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 p-6 border-b border-glass-border">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">Accessibility Settings</h2>
                <p className="text-secondary text-sm">
                  Customize your gaming experience for optimal accessibility
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-muted hover:text-primary transition-colors text-2xl"
                aria-label="Close accessibility settings"
              >
                ×
              </button>
            </div>

            {/* Settings Content */}
            <div className="p-6 space-y-6">
              {/* Visual Settings */}
              <section>
                <h3 className="text-lg font-semibold text-primary mb-4">Visual Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-primary font-medium">Reduced Motion</div>
                      <p className="text-secondary text-sm">Minimize animations and transitions</p>
                    </div>
                    <button
                      onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.reducedMotion ? 'bg-accent-pink' : 'bg-gray-600'
                      }`}
                      aria-label={`${settings.reducedMotion ? 'Disable' : 'Enable'} reduced motion`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.reducedMotion ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-primary font-medium">High Contrast</div>
                      <p className="text-secondary text-sm">
                        Increase contrast for better visibility
                      </p>
                    </div>
                    <button
                      onClick={() => updateSetting('highContrast', !settings.highContrast)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.highContrast ? 'bg-accent-pink' : 'bg-gray-600'
                      }`}
                      aria-label={`${settings.highContrast ? 'Disable' : 'Enable'} high contrast`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.highContrast ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-primary font-medium">Color Blind Support</div>
                      <p className="text-secondary text-sm">Use color-blind friendly palettes</p>
                    </div>
                    <button
                      onClick={() =>
                        updateSetting('colorBlindSupport', !settings.colorBlindSupport)
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.colorBlindSupport ? 'bg-accent-pink' : 'bg-gray-600'
                      }`}
                      aria-label={`${settings.colorBlindSupport ? 'Disable' : 'Enable'} color blind support`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.colorBlindSupport ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <div className="text-primary font-medium mb-2 block">Font Size</div>
                    <div className="flex space-x-2">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => updateSetting('fontSize', size)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            settings.fontSize === size
                              ? 'bg-accent-pink text-white'
                              : 'bg-glass-bg text-secondary hover:bg-glass-bg-hover'
                          }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Audio Settings */}
              <section>
                <h3 className="text-lg font-semibold text-primary mb-4">Audio Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-primary font-medium mb-2 block">
                      Volume: {Math.round(settings.volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.volume}
                      onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-primary font-medium">Captions</div>
                      <p className="text-secondary text-sm">Show text for dialogue and sounds</p>
                    </div>
                    <button
                      onClick={() => updateSetting('captions', !settings.captions)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.captions ? 'bg-accent-pink' : 'bg-gray-600'
                      }`}
                      aria-label={`${settings.captions ? 'Disable' : 'Enable'} captions`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.captions ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-primary font-medium">Audio Descriptions</div>
                      <p className="text-secondary text-sm">Describe visual elements with audio</p>
                    </div>
                    <button
                      onClick={() =>
                        updateSetting('audioDescriptions', !settings.audioDescriptions)
                      }
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.audioDescriptions ? 'bg-accent-pink' : 'bg-gray-600'
                      }`}
                      aria-label={`${settings.audioDescriptions ? 'Disable' : 'Enable'} audio descriptions`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.audioDescriptions ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* Input Settings */}
              <section>
                <h3 className="text-lg font-semibold text-primary mb-4">Input Settings</h3>
                <div>
                  <div className="text-primary font-medium mb-2 block">Preferred Input Method</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['keyboard', 'gamepad', 'touch'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => updateSetting('inputMethod', method)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          settings.inputMethod === method
                            ? 'bg-accent-pink text-white'
                            : 'bg-glass-bg text-secondary hover:bg-glass-bg-hover'
                        }`}
                      >
                        {method.charAt(0).toUpperCase() + method.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center p-6 border-t border-glass-border">
              <button
                onClick={handleReset}
                className="text-muted hover:text-primary transition-colors"
              >
                Reset to Defaults
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-secondary hover:text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Utility function to load settings from localStorage
export function loadAccessibilitySettings(): GameAccessibilitySettings {
  if (typeof window === 'undefined') return defaultSettings;

  try {
    const saved = localStorage.getItem('otm-game-accessibility');
    if (saved) {
      return { ...defaultSettings, ...JSON.parse(saved) };
    }
  } catch (error) {
    console.warn('Failed to load accessibility settings:', error);
  }

  return defaultSettings;
}

// Utility function to apply settings to the document
export function applyAccessibilitySettings(settings: GameAccessibilitySettings) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Apply reduced motion
  if (settings.reducedMotion) {
    root.style.setProperty('--motion-duration', '0ms');
    root.style.setProperty('--motion-delay', '0ms');
  } else {
    root.style.removeProperty('--motion-duration');
    root.style.removeProperty('--motion-delay');
  }

  // Apply high contrast
  if (settings.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }

  // Apply font size
  root.style.setProperty(
    '--game-font-size',
    settings.fontSize === 'small' ? '0.875rem' : settings.fontSize === 'large' ? '1.25rem' : '1rem',
  );

  // Apply color blind support
  if (settings.colorBlindSupport) {
    root.classList.add('color-blind-support');
  } else {
    root.classList.remove('color-blind-support');
  }
}
