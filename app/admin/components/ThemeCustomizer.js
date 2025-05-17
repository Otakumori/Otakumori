'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChromePicker } from 'react-color';

const seasons = [
  {
    id: 'spring',
    name: 'Spring',
    defaultColors: {
      primary: '#FF69B4',
      secondary: '#FFB6C1',
      accent: '#FFC0CB',
      background: '#FFF0F5',
    },
  },
  {
    id: 'summer',
    name: 'Summer',
    defaultColors: {
      primary: '#FF6B6B',
      secondary: '#FF8E8E',
      accent: '#FFA07A',
      background: '#FFF5EE',
    },
  },
  {
    id: 'autumn',
    name: 'Autumn',
    defaultColors: {
      primary: '#D2691E',
      secondary: '#CD853F',
      accent: '#DEB887',
      background: '#FFE4C4',
    },
  },
  {
    id: 'winter',
    name: 'Winter',
    defaultColors: {
      primary: '#4682B4',
      secondary: '#87CEEB',
      accent: '#B0E0E6',
      background: '#F0F8FF',
    },
  },
];

export default function ThemeCustomizer() {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);
  const [colors, setColors] = useState(seasons[0].defaultColors);
  const [activeColorPicker, setActiveColorPicker] = useState(null);
  const [particleSettings, setParticleSettings] = useState({
    density: 50,
    speed: 1,
    size: 1,
    opacity: 0.8,
  });

  const handleColorChange = (color, type) => {
    setColors(prev => ({
      ...prev,
      [type]: color.hex,
    }));
  };

  const handleSeasonChange = season => {
    setSelectedSeason(season);
    setColors(season.defaultColors);
  };

  const handleParticleSettingChange = (setting, value) => {
    setParticleSettings(prev => ({
      ...prev,
      [setting]: value,
    }));
  };

  const saveTheme = async () => {
    try {
      // TODO: Implement API call to save theme settings
      console.log('Saving theme:', { season: selectedSeason.id, colors, particleSettings });
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Season Selection */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {seasons.map(season => (
          <motion.button
            key={season.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSeasonChange(season)}
            className={`rounded-lg p-4 ${
              selectedSeason.id === season.id
                ? 'bg-pink-500 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            {season.name}
          </motion.button>
        ))}
      </div>

      {/* Color Customization */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {Object.entries(colors).map(([type, color]) => (
          <div key={type} className="space-y-2">
            <label className="capitalize text-gray-300">{type} Color</label>
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveColorPicker(type)}
                className="h-12 w-full rounded-lg border-2 border-gray-700"
                style={{ backgroundColor: color }}
              />
              {activeColorPicker === type && (
                <div className="absolute z-10 mt-2">
                  <div className="fixed inset-0" onClick={() => setActiveColorPicker(null)} />
                  <ChromePicker color={color} onChange={color => handleColorChange(color, type)} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Particle Settings */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-pink-400">Particle Effects</h3>
        {Object.entries(particleSettings).map(([setting, value]) => (
          <div key={setting} className="space-y-2">
            <label className="capitalize text-gray-300">
              {setting.replace(/([A-Z])/g, ' $1').trim()}
            </label>
            <input
              type="range"
              min="0"
              max={setting === 'density' ? '100' : '1'}
              step="0.1"
              value={value}
              onChange={e => handleParticleSettingChange(setting, parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="rounded-lg bg-gray-800/50 p-6 backdrop-blur-lg">
        <h3 className="mb-4 text-xl font-bold text-pink-400">Theme Preview</h3>
        <div className="h-48 w-full rounded-lg" style={{ backgroundColor: colors.background }}>
          {/* Add preview elements here */}
        </div>
      </div>

      {/* Save Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={saveTheme}
        className="w-full rounded-lg bg-pink-500 py-3 font-semibold text-white hover:bg-pink-600"
      >
        Save Theme
      </motion.button>
    </div>
  );
}
