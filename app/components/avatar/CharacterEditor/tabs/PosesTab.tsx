'use client';

import { useState } from 'react';
import { POSE_PRESETS } from '../constants';
import type { PosePreset } from '../types';
import { CustomizationPanel } from '../CustomizationPanel';

interface PosesTabProps {
  showNsfwContent: boolean;
  onAnimationChange?: (isAnimating: boolean) => void;
}

export function PosesTab({ showNsfwContent, onAnimationChange }: PosesTabProps) {
  const [currentPose, setCurrentPose] = useState<PosePreset>(POSE_PRESETS[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnimationChange = (value: boolean) => {
    setIsAnimating(value);
    onAnimationChange?.(value);
  };

  return (
    <div id="panel-poses" role="tabpanel" aria-labelledby="tab-poses" className="space-y-4">
      <CustomizationPanel title="Pose Categories">
        <div className="flex flex-wrap gap-2">
          {['idle', 'action', 'emote', 'dance', ...(showNsfwContent ? ['nsfw'] : [])].map(
            (category) => (
              <button
                key={category}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  currentPose.category === category
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ),
          )}
        </div>
      </CustomizationPanel>

      <CustomizationPanel title="Available Poses">
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {POSE_PRESETS.filter((pose) => showNsfwContent || pose.category !== 'nsfw').map(
            (pose) => (
              <button
                key={pose.id}
                onClick={() => {
                  setCurrentPose(pose);
                  handleAnimationChange(true);
                  // Auto-stop animation after 3 seconds for looping animations
                  if (
                    ['idle', 'walk', 'run', 'dance_1', 'dance_2', 'dance_3'].includes(
                      pose.animation,
                    )
                  ) {
                    setTimeout(() => handleAnimationChange(false), 3000);
                  }
                }}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  currentPose.id === pose.id
                    ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                    : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium">{pose.name}</div>
                    <div className="text-xs text-white/60 mt-1">{pose.description}</div>
                  </div>
                  <div className="text-xs text-white/40 capitalize">{pose.category}</div>
                </div>
              </button>
            ),
          )}
        </div>
      </CustomizationPanel>

      <CustomizationPanel title="Animation Controls">
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnimating}
              onChange={(e) => handleAnimationChange(e.target.checked)}
              className="w-4 h-4 text-pink-500 bg-white/10 border-white/20 rounded focus:ring-pink-500"
            />
            <span className="text-sm text-white/80">Enable Animation</span>
          </label>
          <button
            onClick={() => handleAnimationChange(!isAnimating)}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg transition-colors text-sm"
          >
            {isAnimating ? 'Stop Animation' : 'Play Animation'}
          </button>
        </div>
      </CustomizationPanel>
    </div>
  );
}

