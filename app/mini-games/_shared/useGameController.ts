'use client';

import { useEffect, useRef, useState } from 'react';

import {
  controllerService,
  type ControllerCapability,
  type ControllerSnapshot,
  type ControllerStatus,
} from '../_input/gamepad.safe';

export const GAME_CONTROLLER_CAPABILITIES = {
  'otaku-beat-em-up': 'FULL_GAMEPLAY',
  'petal-storm-rhythm': 'GAMEPLAY_PARTIAL',
  'bubble-ragdoll': 'MENUS_ONLY',
  blossomware: 'MENUS_ONLY',
} as const satisfies Readonly<Record<string, ControllerCapability>>;

export function useControllerFrames({
  enabled = true,
  onFrame,
}: {
  enabled?: boolean;
  onFrame: (snapshot: ControllerSnapshot | null) => void;
}) {
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  useEffect(() => {
    if (!enabled) return;
    return controllerService.subscribeFrames((snapshot) => onFrameRef.current(snapshot));
  }, [enabled]);
}

export function useControllerStatus() {
  const [status, setStatus] = useState<ControllerStatus>(() => controllerService.getStatus());
  useEffect(() => controllerService.subscribeStatus(setStatus), []);
  return status;
}
