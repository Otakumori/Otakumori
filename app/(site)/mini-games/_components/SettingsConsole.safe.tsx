'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Clock, Gamepad2, Palette, RotateCcw } from 'lucide-react';

interface SettingsConsoleProps {
  onVolumeChange?: (volume: number) => void;
  onThemeChange?: (theme: 'dark' | 'light') => void;
  className?: string;
}

export default function SettingsConsole({
  onVolumeChange,
  onThemeChange,
  className = '',
}: SettingsConsoleProps) {
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [controllerConnected, setControllerConnected] = useState(false);
  const [controllerIndex, setControllerIndex] = useState(-1);

  const volumeRef = useRef<HTMLInputElement>(null);
  const timeIntervalRef = useRef<any>(undefined);

  // Update time every second
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime();

    timeIntervalRef.current = setInterval(updateTime, 1000);
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  // Check for gamepad connection
  useEffect(() => {
    const checkGamepad = () => {
      const gamepads = navigator.getGamepads();
      const connected = gamepads.some((pad, index) => {
        if (pad) {
          setControllerIndex(index);
          return true;
        }
        return false;
      });
      setControllerConnected(connected);
    };

    const handleGamepadConnected = (e: GamepadEvent) => {
      setControllerConnected(true);
      setControllerIndex(e.gamepad.index);
    };

    const handleGamepadDisconnected = () => {
      setControllerConnected(false);
      setControllerIndex(-1);
    };

    // Check initially
    checkGamepad();

    // Listen for gamepad events
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    // Poll for gamepad state
    const gamepadInterval = setInterval(checkGamepad, 1000);

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      clearInterval(gamepadInterval);
    };
  }, []);

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setMasterVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  // Handle mute toggle
  const handleMuteToggle = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    onVolumeChange?.(newMuted ? 0 : masterVolume);
  };

  // Handle theme change
  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme);
    onThemeChange?.(newTheme);
  };

  // Reset settings
  const handleReset = () => {
    setMasterVolume(0.7);
    setIsMuted(false);
    setTheme('dark');
    onVolumeChange?.(0.7);
    onThemeChange?.('dark');
  };

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div
      className={`
      w-full max-w-4xl mx-auto p-8
      bg-gray-900/95 backdrop-blur-lg
      border border-white/20 rounded-2xl
      shadow-2xl
      ${className}
    `}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Otakumori™ 2025</h1>
        <p className="text-gray-400">System Settings</p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Audio Settings */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Audio Settings
          </h2>

          {/* Master Volume */}
          <div className="space-y-2">
            <label
              htmlFor="master-volume-slider"
              className="block text-sm font-medium text-gray-300"
            >
              Master Volume
            </label>
            <div className="flex items-center gap-4">
              <input
                id="master-volume-slider"
                ref={volumeRef}
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : masterVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                         slider:bg-pink-500 slider:h-2 slider:rounded-lg slider:appearance-none
                         focus:outline-none focus:ring-2 focus:ring-pink-500"
                disabled={isMuted}
              />
              <button
                onClick={handleMuteToggle}
                className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-gray-400" />
                ) : (
                  <Volume2 className="w-5 h-5 text-pink-400" />
                )}
              </button>
              <span className="text-sm text-gray-400 w-12 text-right">
                {Math.round((isMuted ? 0 : masterVolume) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            System Information
          </h2>

          {/* Date & Time */}
          <div className="space-y-2">
            <div className="block text-sm font-medium text-gray-300">Current Time</div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-2xl font-mono text-white">{formatTime(currentTime)}</div>
              <div className="text-sm text-gray-400 mt-1">{formatDate(currentTime)}</div>
            </div>
          </div>

          {/* Controller Status */}
          <div className="space-y-2">
            <div className="block text-sm font-medium text-gray-300">Controller Status</div>
            <div className="flex items-center gap-2 p-4 bg-gray-800 rounded-lg">
              <Gamepad2
                className={`w-5 h-5 ${controllerConnected ? 'text-green-400' : 'text-gray-500'}`}
              />
              <span
                className={`text-sm ${controllerConnected ? 'text-green-400' : 'text-gray-500'}`}
              >
                {controllerConnected
                  ? `Controller ${controllerIndex + 1} Connected`
                  : 'No Controller Detected'}
              </span>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Display Settings
          </h2>

          {/* Theme Selection */}
          <div className="space-y-2">
            <div className="block text-sm font-medium text-gray-300">Theme</div>
            <div className="flex gap-2" role="group" aria-label="Theme selection">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-4 py-2 rounded-lg transition-colors
                  ${
                    theme === 'dark'
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                Dark
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-4 py-2 rounded-lg transition-colors
                  ${
                    theme === 'light'
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
              >
                Light
              </button>
            </div>
          </div>
        </div>

        {/* System Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            System Actions
          </h2>

          {/* Reset Settings */}
          <div className="space-y-2">
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg
                       transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-sm text-gray-400">Select a face to navigate • Press ESC to return</p>
      </div>
    </div>
  );
}
