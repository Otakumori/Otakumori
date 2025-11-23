'use client';

import { CAMERA_PRESETS } from '../constants';
import type { CameraPreset } from '../types';
import { CustomizationPanel } from '../CustomizationPanel';
import { SliderControl } from '../SliderControl';

interface CameraTabProps {
  currentCamera: CameraPreset;
  setCurrentCamera: (preset: CameraPreset) => void;
  cameraZoom: number;
  setCameraZoom: (zoom: number) => void;
  cameraRotation: { x: number; y: number };
  setCameraRotation: (updater: (prev: { x: number; y: number }) => { x: number; y: number }) => void;
  resetCamera: () => void;
}

export function CameraTab({
  currentCamera,
  setCurrentCamera,
  cameraZoom,
  setCameraZoom,
  cameraRotation,
  setCameraRotation,
  resetCamera,
}: CameraTabProps) {
  return (
    <div
      id="panel-camera"
      role="tabpanel"
      aria-labelledby="tab-camera"
      className="space-y-4"
    >
      <CustomizationPanel title="Camera Presets">
        <div className="grid grid-cols-2 gap-2">
          {CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => setCurrentCamera(preset)}
              className={`p-2 rounded-lg border transition-all text-left ${
                currentCamera.id === preset.id
                  ? 'border-pink-500 bg-pink-500/20 text-pink-100'
                  : 'border-white/20 bg-white/5 hover:bg-white/10 text-white/80'
              }`}
            >
              <div className="text-xs font-medium">{preset.name}</div>
            </button>
          ))}
        </div>
      </CustomizationPanel>

      <CustomizationPanel title="Camera Controls">
        <SliderControl
          label="Zoom"
          value={cameraZoom}
          min={0.5}
          max={3}
          step={0.1}
          onChange={setCameraZoom}
          format={(value) => `${(value * 100).toFixed(0)}%`}
        />
        <SliderControl
          label="Rotation X"
          value={cameraRotation.x}
          min={-180}
          max={180}
          step={1}
          onChange={(value) => setCameraRotation((prev) => ({ ...prev, x: value }))}
          format={(value) => `${value.toFixed(0)}°`}
        />
        <SliderControl
          label="Rotation Y"
          value={cameraRotation.y}
          min={-180}
          max={180}
          step={1}
          onChange={(value) => setCameraRotation((prev) => ({ ...prev, y: value }))}
          format={(value) => `${value.toFixed(0)}°`}
        />
      </CustomizationPanel>

      <CustomizationPanel title="Quick Actions">
        <div className="space-y-2">
          <button
            onClick={() => setCameraZoom(1)}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Reset Zoom
          </button>
          <button
            onClick={() => setCameraRotation(() => ({ x: 0, y: 0 }))}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Reset Rotation
          </button>
        </div>
      </CustomizationPanel>
    </div>
  );
}

