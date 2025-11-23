'use client';

import { useState, useCallback } from 'react';
import { CAMERA_PRESETS } from '../constants';
import type { CameraPreset } from '../types';

export function useCameraControls() {
  const [currentCamera, setCurrentCamera] = useState<CameraPreset>(CAMERA_PRESETS[0]);
  const [cameraZoom, setCameraZoom] = useState(1);
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 });

  const resetCamera = useCallback(() => {
    setCameraZoom(1);
    setCameraRotation({ x: 0, y: 0 });
  }, []);

  return {
    currentCamera,
    setCurrentCamera,
    cameraZoom,
    setCameraZoom,
    cameraRotation,
    setCameraRotation,
    resetCamera,
  };
}

