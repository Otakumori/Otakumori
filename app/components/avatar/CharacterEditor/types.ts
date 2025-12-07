import type { AvatarConfiguration, AvatarPartType } from '@/app/lib/3d/avatar-parts';
import { type avatarPartManager } from '@/app/lib/3d/avatar-parts';
import type * as THREE from 'three';
import type React from 'react';

export interface CameraPreset {
  id: string;
  name: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  }

export interface PosePreset {
  id: string;
  name: string;
  animation: string;
  description: string;
  category: 'idle' | 'action' | 'emote' | 'dance' | 'nsfw';
  }

export interface BackgroundPreset {
  id: string;
  name: string;
  type: 'color' | 'gradient' | 'environment' | 'studio';
  value: string;
  hdrUrl?: string;
  }

export interface CustomizationPanelProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  }

export interface ColorPickerProps {
  label: string;
  value: THREE.Color;
  onChange: (color: THREE.Color) => void;
}

export interface PartSelectorProps {
  label: string;
  partType: AvatarPartType;
  currentPartId?: string;
  onPartChange: (partId: string) => void;
  showNsfwContent: boolean;
  searchQuery?: string;
  selectedCategory?: string;
  resolveParts?: (type: AvatarPartType) => ReturnType<typeof avatarPartManager.getPartsByType>;
  }

export interface CharacterEditorProps {
  initialConfiguration?: AvatarConfiguration;
  onConfigurationChange?: (config: AvatarConfiguration) => void;
  onSave?: (config: AvatarConfiguration) => void;
  onUseInGame?: (config: AvatarConfiguration) => void;
  isGuest?: boolean;
  className?: string;
}

